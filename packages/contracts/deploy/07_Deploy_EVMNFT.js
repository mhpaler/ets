const { ethers, upgrades } = require("hardhat");
const { verify } = require("./utils/verify.js");
const { saveNetworkConfig, readNetworkConfig } = require("./utils/config.js");

module.exports = async ({
  getChainId,
  deployments,
  getNamedAccounts
}) => {
    const { save, log } = deployments;
    const networkConfig = readNetworkConfig();
    const chainId = await getChainId();
    const { ETSAdmin } = await getNamedAccounts()
    const EVMNFT = await ethers.getContractFactory("EVMNFT");
    let etsAddress;

    if (chainId == 31337) {
      let ets = await deployments.get('ETS');
      etsAddress = ets.address
    } else {
      etsAddress = networkConfig[chainId].contracts['ETS'].address;
    }

    // Deploy ETS core using OpenZeppelin upgrades plugin.
    const deployment = await upgrades.deployProxy(
      EVMNFT,
      [ etsAddress, ETSAdmin, ETSAdmin ],
      { kind: "uups" },
    );

    await deployment.deployed();

    const implementation = await upgrades.erc1967.getImplementationAddress(deployment.address);

    if (!(process.env.DISABLE_EVMNFT_VERIFICATION === 'true')) {
      // Verify & Update network configuration file.
      await verify("EVMNFT", deployment, implementation, []);
    }

    await saveNetworkConfig("EVMNFT", deployment, implementation, false);

    // Add to hardhat-deploy deployments.
    artifact = await deployments.getExtendedArtifact('EVMNFT');
    proxyDeployments = {
      address: deployment.address,
      ...artifact
    }
    await save('EVMNFT', proxyDeployments);

    log("====================================================");
    log('EVMNFT proxy deployed to -> ' + deployment.address);
    log('EVMNFT implementation deployed to -> ' + implementation);
    log("====================================================");
};

module.exports.tags = ['ets_evmTagger'];
module.exports.dependencies = ['ets_ensure']
