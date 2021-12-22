# Hashtag Protocol Deployment

Contained in this folder are two different implementations of hardhat deployment scripts.

`/hardhat-deploy/` contains deployment scripts that utilize [hardhat-deploy plugin](https://hardhat.org/plugins/hardhat-deploy.html) `/hardhat-upgrades/` contains scripts that utilize [hardhat-upgrades](https://hardhat.org/plugins/openzeppelin-hardhat-upgrades.html)

The scripts in `hardhat-upgrades` are our production scripts at the moment. While the hardhat-deploy plugin is indeed powerful, we had great difficulty getting it to work with UUPS proxy upgrades, the upgrade pattern used for HTPs main contracts.

The actual scripts called to kick off a deployment are in /scripts. A deployment script instantiates a `Deployer` object (defined in `utils/deployer.js`), and passes to it one or more `tags` which correspond to deployment `tasks` defined in `utils/tasks.js`.

For example, the script `scripts/upgrade_all.js` executes the tasks `"upgrade_hashtag_access_controls", "upgrade_hashtag_protocol", "upgrade_erc721_tagging_registry"`

To deploy the Hashtag Protocol contracts locally, perform the following from the root of `/hashtag-contracts/`:

``` bash
hardhat run --network <network> deploy/hardhat-upgrades/scripts/deploy_all.js
```

To test the upgrade of a contract, for example HashtagAccessControls.sol, you would perform the following:

``` bash
hardhat run --network <network> deploy/hardhat-upgrades/scripts/upgrade_access_controls.js
```

Note that when deployments are run, deployment artifacts (ie contract addresses per network) are saved to both `/.deployments/[chainid].json` and `/config/config.json`.
