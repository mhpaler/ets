# ETS Subgraph

To develop using a local subgraph, you'll need to have [Docker](https://www.docker.com/products/docker-desktop) installed. Be sure you have already run `npm hardhat` and `npm hardhat:deploy` so your contracts are deployed to the local Hardhat network before running the following commands.

First, open up a new terminal and spin up a local Docker graph node container. It will automatically clean up any old data:

```bash
pnpm run graph:node-start
```

In another terminal, generate your local subgraph.yaml (uses a script to parse hardhat config into a template):

```bash
pnpm run graph:prepare-local
```

Next, create your local subgraph (only required to run once):

```bash
pnpm graph:create-local
```

Deploy your local subgraph:

```bash
pnpm graph:ship-local
```

Once you make changes to your subgraph in `packages/subgraph`, you can deploy your contracts and your subgraph in one go by running:

```bash
pnpm graph:deploy-and-graph
```

If you want to clean the deployed graph & it's data but keep the node running, run:

```bash
pnpm graph:node-clean
```

If you want to remove the Docker container, run:

```bash
pnpm graph:node-stop
```
