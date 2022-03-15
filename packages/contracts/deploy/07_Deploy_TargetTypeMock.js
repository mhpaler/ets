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
    const MockNftTagger = await ethers.getContractFactory("MockNftTagger");
    let etsAddress;

    if (chainId == 31337) {
      let ets = await deployments.get('ETS');
      etsAddress = ets.address
    } else {
      etsAddress = networkConfig[chainId].contracts['ETS'].address;
    }

    // Deploy ETS core using OpenZeppelin upgrades plugin.
    const deployment = await upgrades.deployProxy(
      MockNftTagger,
      [ etsAddress, ETSAdmin, ETSAdmin ],
      { kind: "uups" },
    );

    await deployment.deployed();

    const implementation = await upgrades.erc1967.getImplementationAddress(deployment.address);

    if (!(process.env.DISABLE_MockNftTagger_VERIFICATION === 'true')) {
      // Verify & Update network configuration file.
      await verify("MockNftTagger", deployment, implementation, []);
    }

    await saveNetworkConfig("MockNftTagger", deployment, implementation, false);

    // Add to hardhat-deploy deployments.
    artifact = await deployments.getExtendedArtifact('MockNftTagger');
    proxyDeployments = {
      address: deployment.address,
      ...artifact
    }
    await save('MockNftTagger', proxyDeployments);

    log("====================================================");
    log('MockNftTagger proxy deployed to -> ' + deployment.address);
    log('MockNftTagger implementation deployed to -> ' + implementation);
    log("====================================================");
};

module.exports.tags = ['ets_evmTagger'];
module.exports.dependencies = ['ets_ensure']
