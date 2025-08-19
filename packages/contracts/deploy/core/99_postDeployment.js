const { ethers, network } = require("hardhat");
const { setup } = require("../utils/setup.js");

module.exports = async ({ deployments }) => {
  console.info("============ STARTING POST-DEPLOYMENT CONFIGURATION ============");

  let accounts;
  try {
    const setupResult = await setup();
    accounts = setupResult.accounts;
    console.info("Setup completed successfully");
    console.info("ETSAdmin address:", accounts.ETSAdmin.address);
    console.info("ETSPlatform address:", accounts.ETSPlatform.address);
    console.info("ETSOracle address:", accounts.ETSOracle.address);
  } catch (error) {
    console.error("Error during setup:", error);
    throw error;
  }

  try {
    const etsAccessControls = await deployments.get("ETSAccessControls");
    console.info("ETSAccessControls address:", etsAccessControls.address);
    const ETSAccessControls = await ethers.getContractAt("ETSAccessControls", etsAccessControls.address);

    const etsTokenDeployment = await deployments.get("ETSToken");
    console.info("ETSToken address:", etsTokenDeployment.address);
    const ETSToken = await ethers.getContractAt("ETSToken", etsTokenDeployment.address);

    const etsTarget = await deployments.get("ETSTarget");
    console.info("ETSTarget address:", etsTarget.address);
    const ETSTarget = await ethers.getContractAt("ETSTarget", etsTarget.address);

    const etsEnrichTarget = await deployments.get("ETSEnrichTarget");
    console.info("ETSEnrichTarget address:", etsEnrichTarget.address);

    const ets = await deployments.get("ETS");
    console.info("ETS address:", ets.address);

    const etsRelayerFactory = await deployments.get("ETSRelayerFactory");
    console.info("ETSRelayerFactory address:", etsRelayerFactory.address);
    const ETSRelayerFactory = await ethers.getContractAt("ETSRelayerFactory", etsRelayerFactory.address);

    // Deploy and configure MockZoraFactory for localhost
    if (network.name === "localhost") {
      console.info("============ DEPLOY MOCKZORAFACTORY FOR LOCALHOST ============");
      
      // Deploy MockZoraFactory
      const MockZoraFactory = await ethers.getContractFactory("MockZoraFactory");
      const mockZoraFactory = await MockZoraFactory.connect(accounts.ETSAdmin).deploy();
      await mockZoraFactory.waitForDeployment();
      const mockZoraFactoryAddress = await mockZoraFactory.getAddress();
      
      console.info("MockZoraFactory deployed to:", mockZoraFactoryAddress);
      
      // Update ETSToken configuration with MockZoraFactory
      console.info("Updating ETSToken Zora configuration...");
      await ETSToken.connect(accounts.ETSPlatform).setZoraFactoryAddress(mockZoraFactoryAddress);
      // Note: ZORA_CREATOR_EOA and ZORA_PLATFORM_REFERRER should already be set correctly during initial deployment
      // But we'll verify and update them to ensure consistency
      await ETSToken.connect(accounts.ETSPlatform).setZoraCreatorEOA(accounts.ETSPlatform.address);
      await ETSToken.connect(accounts.ETSPlatform).setZoraPlatformReferrer(accounts.ETSPlatform.address);
      await ETSToken.connect(accounts.ETSPlatform).setZoraPoolConfig("0x");
      
      console.info("✅ MockZoraFactory configuration completed");
      console.info("   Factory address:", mockZoraFactoryAddress);
      console.info("   Creator EOA:", accounts.ETSPlatform.address);
      console.info("   Platform referrer:", accounts.ETSPlatform.address);
      console.info("   Pool config: 0x (empty)");
    }

    console.info("============ CONFIGURE ROLES & APPROVALS ============");
    console.info("See /packages/contracts/deploy/deploy.js for settings.");

    let hardhat_automine;
    if (network.config.chainId === 31337) {
      hardhat_automine = await network.provider.send("hardhat_getAutomine");
      console.info("Initial Hardhat automine setting:", hardhat_automine);

      if (hardhat_automine === false) {
        await network.provider.send("evm_setAutomine", [true]);
        console.info("Hardhat automine set to", await network.provider.send("hardhat_getAutomine"));
      }
    }

    console.info("Configuring role admins...");
    await ETSAccessControls.setRoleAdmin(
      await ETSAccessControls.RELAYER_FACTORY_ROLE(),
      await ETSAccessControls.RELAYER_ADMIN_ROLE(),
    );
    await ETSAccessControls.setRoleAdmin(
      await ETSAccessControls.RELAYER_ROLE(),
      await ETSAccessControls.RELAYER_FACTORY_ROLE(),
    );

    console.info("Granting roles...");
    await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), accounts.ETSAdmin.address);
    await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), accounts.ETSPlatform.address);
    await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), etsAccessControls.address);
    await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), etsTokenDeployment.address);
    await ETSAccessControls.grantRole(await ETSAccessControls.AUCTION_ORACLE_ROLE(), accounts.ETSPlatform.address);
    await ETSAccessControls.grantRole(await ETSAccessControls.AUCTION_ORACLE_ROLE(), accounts.ETSOracle.address);
    await ETSAccessControls.grantRole(await ETSAccessControls.SMART_CONTRACT_ROLE(), accounts.ETSAdmin.address);

    console.info("Setting EnrichTarget...");
    await ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(etsEnrichTarget.address);

    console.info("Setting ETS Core on ETSToken...");
    await ETSToken.connect(accounts.ETSPlatform).setETSCore(ets.address);

    console.info("Granting RELAYER_FACTORY_ROLE to ETSRelayerFactory...");
    await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_FACTORY_ROLE(), etsRelayerFactory.address);

    console.info("Adding relayer proxy for tests...");
    await ETSRelayerFactory.connect(accounts.ETSPlatform).addRelayer("ETSRelayer");

    if (network.config.chainId === 31337) {
      if (hardhat_automine === false && (await network.provider.send("hardhat_getAutomine"))) {
        await network.provider.send("evm_setAutomine", [false]);
        console.info("Hardhat automine set back to", await network.provider.send("hardhat_getAutomine"));
      }
    }

    console.info("============ POST-DEPLOYMENT CONFIGURATION COMPLETED ============");
  } catch (error) {
    console.error("Error during post-deployment configuration:", error);
    console.error("Error stack trace:", error.stack);
    throw error;
  }
};

module.exports.dependencies = ["ETSRelayerFactory"];
module.exports.tags = ["deployAll", "postDeployment"];
