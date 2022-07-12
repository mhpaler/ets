# ETS Deployment scripts

## Quickstart

Configure hardhat.config.js to meet your needs, then from within the contracts-core root, run

```bash
hardhat deploy --tags deployAll --network localhost
```

## Deployment details

ETS deployment scripts rely heavily on [Hardhat
Deploy](https://www.npmjs.com/package/hardhat-deploy) and [Open Zeppelin
Upgrades](https://www.npmjs.com/package/@openzeppelin/hardhat-upgrades) plugins.

For granularity, each contract is deployed with a different script. Settings common or reused
between scripts are in `setup.js`.

Order of deployment is important. This is controlled by the tag and a dependency feature provided by
hardhat-deploy. When the deployment script (deploy.js) begins by passing the deployAll tag to
hardhat-deploy, it claims as dependency the last script to be deployed (ETSTargetTagger).
ETSTargetTagger.js in turn sets its dependency as ETS. This dependency chain continues until it
reaches the last dependency (ETSAccessControls) at which point the contracts will begin deploying in
the desired order.

Once everything is deployed, all of the final configuration settings in `deploy.js` are executed.

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
using the verify task provided by
[hardhat-etherscan](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan). For
more details see `utils/verify.js`
