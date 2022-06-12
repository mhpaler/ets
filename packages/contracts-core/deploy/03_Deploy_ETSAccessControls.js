const { ethers, upgrades } = require("hardhat");
const { verify } = require("./utils/verify.js");
const { saveNetworkConfig } = require("./utils/config.js");

module.exports = async ({
  getNamedAccounts,
  deployments
}) => {
    const { save, log } = deployments;
    const {ETSAdmin, ETSPublisher} = await getNamedAccounts();
    const ETSAccessControls = await ethers.getContractFactory("ETSAccessControls");

    // Deploy ETS Access Controls.
    const deployment = await upgrades.deployProxy(ETSAccessControls, { kind: "uups" });
    await deployment.deployed();
    const implementation = await upgrades.erc1967.getImplementationAddress(deployment.address);

    if (!(process.env.DISABLE_ETSAccessControls_VERIFICATION === 'true')) {
      // Verify & Update network configuration file.
      await verify("ETSAccessControls", deployment, implementation, []);
    }

    await saveNetworkConfig("ETSAccessControls", deployment, implementation, false);

    // Add to hardhat-deploy deployments.
    let artifact = await deployments.getExtendedArtifact('ETSAccessControls');
    let proxyDeployments = {
        address: deployment.address,
        ...artifact
    }
    await save('ETSAccessControls', proxyDeployments);

    log("====================================================");
    log('ETSAccessControls proxy deployed to -> ' + deployment.address);
    log('ETSAccessControls implementation deployed to -> ' + implementation);
    log("====================================================");
};

module.exports.tags = ['ets_access_controls'];
