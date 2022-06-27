# Contracts

Contracts are located in `packages/contracts-core`.

We use [Hardhat](https://hardhat.org/) as our Solidity smart contract development environment. Before using Hardhat, make a copy of `.env.example` in the project root named `.env`. The default settings in there should be enough to get you going. Next, starting in the `contracts-core` directory, start up Hardhat:

```bash
pnpm hardhat
```

Running `pnpm hardhat` spins up a Hardhat network instance that you can connect to using MetaMask. In a different terminal in the same directory, run:

```bash
pnpm deploy
```

This will deploy the contracts to the Hardhat network.

Or, if you would like to deploy and then watch the [contracts](#contracts) for changes and auto-deploy them to the local Hardhat network, you can just run:

```bash
pnpm watch
```

Deployment and watching scripts are located in `packages/contracts/scripts` and `packages/contracts/deploy`.

#### Ethernal

We are big fans of using [Ethernal](https://doc.tryethernal.com/) to help with smart contract development. Think of Ethernal like Etherscan, but for your locally running Hardhat blockchain. We use it to quickly interact with our locally deployed contracts.

Once you have Ethernal setup, enable it for local ETS development by setting the following in your .env file:

```text
ETHERNAL_DISABLED=false
ETHERNAL_WORKSPACE=[you local workspace name]
```

Now when you run `npm hardhat:deploy` your contracts will be automatically verified in the Ethernal interface allowing you to directly interact with them.

Note: its a good idea when re-deploying contracts to first reset your Ethernal workspace by issuing the following command:

```txt
ethernal reset [workspace name]
```

Remember to use quotes around `workspace name` if it has spaces.

### Tests

To run tests:

```bash
pnpm hardhat-test
```

### Deployments

To deploy contracts to Polygon Mumbai, run:

```bash
pnpm deploy-mumbai
```
