#!/bin/bash
# Clear cache to ensure a clean build
rm -rf node_modules/.cache

# Use the new build script instead of turbo directly
pnpm run build:offchain-api

# Since build:offchain-api already CDs into apps/offchain-api and then back out,
# we need to explicitly CD again to run the built app
cd apps/offchain-api

# Run the built application in production mode
NODE_ENV=production node dist/index.js
