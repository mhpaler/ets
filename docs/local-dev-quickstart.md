# Local development quickstart

[work in progress]

We use [Hardhat](https://hardhat.org/) as our Solidity smart contract development environment. Before using Hardhat, make a copy of `.env.example` in the project root named `.env`. The default settings in there should be enough to get you going. Next, starting in the `contracts` directory, start up Hardhat:

```bash
pnpm run hardhat
```

Running `pnpm hardhat` spins up a Hardhat network instance that you can connect to using MetaMask. In a different terminal in the same directory, run:

```bash
pnpm run deploy
```

This will deploy the contracts to the Hardhat network.

Deployment and watching scripts are located in `packages/contracts/scripts` and `packages/contracts/deploy`.

## Tests

To run tests, still within the `/packages/contracts` directory:

```bash
pnpm run test
```

## Deployment

### Quickstart

Configure hardhat.config.js to meet your needs, then from within the contracts root, run

```bash
# for localhost
pnpm run deploy

# for mumbai
pnpm run deploy-mumbai

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
