# Multi-stage build for Temporal Processor
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy package.json files
COPY package.json ./
COPY packages/ ./packages/
COPY apps/temporal-processor/package.json ./apps/temporal-processor/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build

# Copy source code
COPY apps/temporal-processor/ ./apps/temporal-processor/
COPY packages/ ./packages/

# Build the application
WORKDIR /app/apps/temporal-processor
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install pnpm and production dependencies
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json and lockfile
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copy built application
COPY --from=build /app/apps/temporal-processor/dist ./apps/temporal-processor/dist
COPY --from=build /app/apps/temporal-processor/package.json ./apps/temporal-processor/
COPY --from=build /app/packages/ ./packages/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Create logs directory
RUN mkdir -p /app/logs

# Set environment
ENV NODE_ENV=production

# Expose health check port (if needed)
EXPOSE 3001

# Switch to non-root user
RUN addgroup -g 1001 -S temporal && \
    adduser -S temporal -u 1001
USER temporal

WORKDIR /app/apps/temporal-processor

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Start the application
CMD ["node", "dist/index.js"]