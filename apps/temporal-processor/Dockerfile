# ===================================
# Multi-stage build for Temporal Processor
# Optimized for Fly.io deployment
# ===================================

FROM node:20-slim AS base

# Install ca-certificates for TLS connections and pnpm
# bash is already included in Debian-based images
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g pnpm@10.14.0

WORKDIR /app

# Copy workspace configuration
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./
COPY .npmrc* ./

# Copy all package.json files for dependency resolution
COPY packages/config/package.json ./packages/config/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/subgraph-endpoints/package.json ./packages/subgraph-endpoints/
COPY apps/temporal-processor/package.json ./apps/temporal-processor/

# Install all dependencies (including dev for build)
RUN pnpm install --frozen-lockfile

# ===================================
# Build stage
# ===================================
FROM base AS build

# Copy source code for all packages
COPY packages/config ./packages/config
COPY packages/contracts ./packages/contracts
COPY packages/subgraph-endpoints ./packages/subgraph-endpoints
COPY apps/temporal-processor ./apps/temporal-processor

# Build packages in dependency order
# contracts must be built first since config imports from it
WORKDIR /app/packages/contracts
RUN pnpm build

WORKDIR /app/packages/config
RUN pnpm build

# Build temporal-processor
WORKDIR /app/apps/temporal-processor
RUN pnpm build

# ===================================
# Production stage
# ===================================
FROM node:20-slim AS production

# Install ca-certificates for TLS connections and pnpm
# bash is already included in Debian-based images
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    npm install -g pnpm@10.14.0

WORKDIR /app

# Copy entire working build from build stage
# NOTE: This includes dev dependencies (~800MB). See docs/backlog/docker-image-optimization.md
# for future optimization opportunities (could reduce to ~400MB with proper pnpm workspace handling)
COPY --from=build /app ./

# Create checkpoint directory for persistent storage (mounted volume on Fly.io)
RUN mkdir -p /app/.checkpoint && \
    mkdir -p /app/logs

# Set environment
ENV NODE_ENV=production

# Expose metrics port (optional - for Prometheus)
EXPOSE 9091

# Create non-root user for security
RUN groupadd --gid 1001 temporal && \
    useradd --uid 1001 --gid temporal --shell /bin/bash --create-home temporal && \
    chown -R temporal:temporal /app

USER temporal

WORKDIR /app/apps/temporal-processor

# Health check (verify Node.js process is responsive)
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Start the Temporal Processor
CMD ["node", "dist/index.js"]