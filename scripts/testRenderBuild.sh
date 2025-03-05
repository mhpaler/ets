# scripts/test-render-build.sh
#!/bin/bash
rm -rf node_modules/.cache
pnpm turbo build --filter=@ethereum-tag-service/offchain-api...
cd apps/offchain-api
NODE_ENV=production node dist/index.js
