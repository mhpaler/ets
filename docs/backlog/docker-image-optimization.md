# Docker Image Optimization - Temporal Processor

**Status:** Backlog
**Priority:** Low (post-MVP)
**Effort:** Medium
**Created:** 2025-10-11

## Context

The temporal processor Docker image currently uses a simple approach that copies the entire working build (including all node_modules with dev dependencies) from the build stage to production. This works reliably but results in a larger image size.

**Current Image Size:** ~800MB (estimated, includes dev dependencies)
**Optimal Image Size:** ~400MB (production dependencies only)

## Problem

The current production stage:
```dockerfile
# Copy everything from build (works but includes dev deps)
COPY --from=build /app ./
```

We attempted to optimize with `pnpm install --prod` and `pnpm deploy`, but encountered module resolution issues with workspace package symlinks. The dynamic imports in the config package fail at runtime:

```
Cannot find module '@ethereum-tag-service/contracts/deployments'
```

## Root Cause

pnpm workspace symlinks created during `pnpm install --prod` don't resolve correctly at runtime when using dynamic imports (`await import()`). The symlinks point to the `.pnpm` store which references workspace packages, but Node's module resolution can't follow them properly in production.

## Attempted Solutions

### 1. pnpm deploy (Failed)
```dockerfile
RUN pnpm --filter=@ethereum-tag-service/temporal-processor deploy /deploy --prod --legacy
```
- **Issue:** pnpm v10 compatibility errors with workspace dependencies
- **Error:** `ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE`

### 2. Fresh pnpm install --prod (Failed)
```dockerfile
# Copy dist + install prod deps
COPY --from=build /app/packages/*/dist ./packages/*/dist
RUN pnpm install --prod --frozen-lockfile
```
- **Issue:** Workspace symlinks don't resolve for dynamic imports
- **Error:** Cannot find module at runtime

### 3. Copy entire build (Current - Works)
```dockerfile
# Simple: everything from build
COPY --from=build /app ./
```
- ✅ **Works reliably**
- ✅ **Exact same module resolution as build**
- ❌ **Larger image size** (~800MB vs ~400MB)
- ✅ **Fast to implement** (MVP priority)

## Proposed Solutions (Future)

### Option A: Fix Dynamic Imports
Replace dynamic imports with static imports in the config package:

```typescript
// Instead of:
const { getContractAddresses } = await import('@ethereum-tag-service/contracts/deployments');

// Use:
import { getContractAddresses } from '@ethereum-tag-service/contracts/deployments';
```

**Pros:**
- Simpler module resolution
- Works with pnpm workspace symlinks
- Can use `pnpm install --prod`

**Cons:**
- May require restructuring to avoid circular dependencies
- ESM/CJS compatibility considerations

### Option B: Bundle with esbuild/webpack
Bundle the entire application into a single file or minimal set of chunks:

```dockerfile
# In build stage
RUN pnpm build  # Now includes bundling step
# In production
COPY --from=build /app/dist/bundle.js ./
```

**Pros:**
- Smallest possible image
- No module resolution issues
- Faster cold starts

**Cons:**
- Requires build tooling setup
- Debugging more difficult
- Source maps needed for errors

### Option C: Improve pnpm deploy
Debug and fix the pnpm deploy issues with pnpm v10:

- Add `inject-workspace-packages: true` to `.npmrc`
- OR downgrade to pnpm v9 in Docker
- OR use `--force-legacy-deploy` config

**Pros:**
- "Proper" pnpm monorepo deployment
- Industry standard approach
- Better documentation/support

**Cons:**
- More complex to debug
- pnpm version constraints
- May still have symlink issues

## Recommendation

**For MVP:** Keep current simple approach (copy entire build)

**Post-MVP:** Option A (fix dynamic imports) is the most pragmatic:
1. Replace dynamic imports with static imports in config package
2. Use `pnpm install --prod` in Dockerfile
3. Test thoroughly to ensure no circular dependency issues

**Estimated savings:** 400-500MB image size reduction

## Related Files

- `/apps/temporal-processor/Dockerfile`
- `/packages/config/src/contracts.ts` (uses dynamic imports)
- `/apps/temporal-processor/scripts/deploy-flyio.sh`

## Notes

- The module resolution works perfectly in local development because pnpm creates proper workspace links
- The issue only manifests in Docker production builds
- Security: Dev dependencies include testing/build tools which aren't needed in production but aren't a major security concern
- Cost: Fly.io charges for storage, but 400MB difference is minimal cost impact
