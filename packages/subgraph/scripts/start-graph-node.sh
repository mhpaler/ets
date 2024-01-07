#!/bin/bash

# Navigate to the graph-node directory
cd ../graph-node

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Run the clean-graph-node command
pnpm clean-graph-node

# Start Docker Compose
docker-compose up
