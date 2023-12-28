# scripts/start-graph-and-deploy.sh

# Start the Graph Node
echo "Starting Graph Node..."
cd graph-node
pnpm clean-graph-node
docker-compose up -d  # -d runs in detached mode
cd ..  # Go back to the root directory

# Wait for the Graph Node to be ready
echo "Waiting for Graph Node to be ready..."
while ! curl -s http://localhost:8020 > /dev/null; do
    sleep 5
    echo "Waiting..."
done

echo "Graph Node is ready. Proceeding with deployment..."

# Run deployment commands
#pnpm ship-local

echo "Deployment complete."
