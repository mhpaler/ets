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
    const EVMNFTMock = await ethers.getContractFactory("EVMNFTMock");
    let etsAddress;

    if (chainId == 31337) {
      let ets = await deployments.get('ETS');
      etsAddress = ets.address
    } else {
      etsAddress = networkConfig[chainId].contracts['ETS'].address;
    }

    // Deploy using OpenZeppelin upgrades plugin.
    const deployment = await upgrades.deployProxy(
      EVMNFTMock,
      [ etsAddress, ETSAdmin, ETSAdmin ],
      { kind: "uups" },
    );

    await deployment.deployed();

    const implementation = await upgrades.erc1967.getImplementationAddress(deployment.address);

    if (!(process.env.DISABLE_EVMNFTMock_VERIFICATION === 'true')) {
      // Verify & Update network configuration file.
      await verify("EVMNFTMock", deployment, implementation, []);
    }

    await saveNetworkConfig("EVMNFTMock", deployment, implementation, false);

    // Add to hardhat-deploy deployments.
    artifact = await deployments.getExtendedArtifact('EVMNFTMock');
    proxyDeployments = {
      address: deployment.address,
      ...artifact
    }
    await save('EVMNFTMock', proxyDeployments);

    log("====================================================");
    log('EVMNFTMock proxy deployed to -> ' + deployment.address);
    log('EVMNFTMock implementation deployed to -> ' + implementation);
    log("====================================================");
};

module.exports.tags = ['ets_evmMockTagger'];
module.exports.dependencies = ['ets_ensure']
