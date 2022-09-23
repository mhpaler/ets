# Ethereum Tag Service Contracts

We use [Hardhat](https://hardhat.org/) as our Solidity smart contract development environment. Before using Hardhat, make a copy of `.env.example` in the project root named `.env`. The default settings in there should be enough to get you going. Next, starting in the `contracts` directory, start up Hardhat:

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

## ETS Deployment

### Quickstart

Configure hardhat.config.js to meet your needs, then from within the contracts root, run

```bash
# for localhost
pnpm deploy

# for mumbai
pnpm deploy-mumbai

# Or calling hardhat directly
hardhat deploy --tags deployAll --network localhost
```

### Deployment details

ETS deployment scripts rely heavily on [Hardhat Deploy](https://www.npmjs.com/package/hardhat-deploy) and [Open Zeppelin Upgrades](https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades) plugins.

For granularity, each contract is deployed with a different script. Settings common or reused
between scripts are in `setup.js`.

Order of deployment is important. This is controlled by the `tag` and a `dependency` features
provided by hardhat-deploy. Deployment begins by passing the `deployAll` tag to hardhat-deploy (see
`deploy.js`). `deployAll` it claims as dependency the last script to be deployed (ETSTargetTagger).
ETSTargetTagger.js in turn sets its dependency (ETS). This dependency chain continues until it
reaches the last dependency (ETSAccessControls) at which point the contracts start deploying from
the last dependency (ETSAccessControls) to the first (ETSTargetTagger).

Once everything is deployed, the final configuration settings in `deploy.js` are executed.

We use [Ethernal](https://doc.tryethernal.com/) as a rapid development tool. If you have Ethernal
enabled, fill out the following in your `.env file` and each contract will be verified as it's
deployed to Ethernal:

```text
ETHERNAL_EMAIL=
ETHERNAL_PASSWORD=
ETHERNAL_DISABLED=false
ETHERNAL_WORKSPACE=
```

Setting `ETHERNAL_DISABLED=false` for on chain deployments will attempt to verify the contracts
using the verify task provided by [hardhat-etherscan](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan). For more details see `utils/verify.js`
