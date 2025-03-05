FROM node:18-alpine

WORKDIR /app

# Copy package.json files for the workspace
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy the offchain-api package
COPY apps/offchain-api ./apps/offchain-api/

# Install dependencies (using pnpm)
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Set working directory to the app
WORKDIR /app/apps/offchain-api

# Build the application
RUN pnpm build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
