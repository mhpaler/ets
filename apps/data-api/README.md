# ETS Subgraph

To develop using a local subgraph, you'll need to have [Docker](https://www.docker.com/products/docker-desktop) installed. Be sure you have already deployed your contracts to the local Hardhat network before running the following commands.

First, open up a new terminal and spin up a local Docker graph node container. It will automatically clean up any old data:

```bash
pnpm graph:node-start
```

In another terminal, generate your local subgraph.yaml (uses a script to parse hardhat config into a template):

```bash
pnpm graph:prepare-local
```

Next, create your local subgraph (only required to run once):

```bash
pnpm graph:create-local
```

Deploy your local subgraph:

```bash
pnpm graph:ship-local
```

Once you make changes to your subgraph in `apps/data-api`, you can deploy your contracts and your subgraph in one go by running:

```bash
pnpm graph:deploy-and-graph
```

If you want to clean the deployed graph & its data but keep the node running, run:

```bash
pnpm graph:node-clean
```

If you want to remove the Docker container, run:

```bash
pnpm graph:node-stop
```

## Settings

```graphql
query Settings {
  globalSettings(id: "globalSettings") {
    id
    tagMinStringLength
    tagMaxStringLength
    taggingFee
    taggingFeePlatformPercentage
    taggingFeeChannelPercentage
  }
}
```

## Tags

```graphql
query Tags($first: Int!, $skip: Int!) {
  tags(first: $first, skip: $skip) {
    id
    tagId
    coinAddress
    originalInput
    displayVersion
    machineName
    creator {
      id
    }
    channel {
      id
      name
    }
    timestamp
    platformRevenue
  }
}
```

## Channels

```graphql
query Channels($first: Int!, $skip: Int!) {
  channels(first: $first, skip: $skip) {
    id
    name
    description
    owner
    admin
    pausedByOwner
    lockedByProtocol
    tagCount
    revenue
    createdAt
  }
}
```
