const { ethers } = require("hardhat");
const { setup } = require("./setup.js");

module.exports = async ({ deployments }) => {
  [accounts, factories, initSettings] = await setup();

  const etsAccessControls = await deployments.get("ETSAccessControls");
  const ETSAccessControls = await ethers.getContractAt("ETSAccessControls", etsAccessControls.address);
  const etsToken = await deployments.get("ETSToken");
  const ETSToken = await ethers.getContractAt("ETSToken", etsToken.address);
  const etsAuctionHouse = await deployments.get("ETSAuctionHouse");
  const ETSAuctionHouse = await ethers.getContractAt("ETSAuctionHouse", etsAuctionHouse.address);
  const etsTarget = await deployments.get("ETSTarget");
  const ETSTarget = await ethers.getContractAt("ETSTarget", etsTarget.address);
  const etsEnrichTarget = await deployments.get("ETSEnrichTarget");
  const ETSEnrichTarget = await ethers.getContractAt("ETSEnrichTarget", etsEnrichTarget.address);
  const ets = await deployments.get("ETS");
  const ETS = await ethers.getContractAt("ETS", ets.address);
  const etsRelayerFactory = await deployments.get("ETSRelayerFactory");
  const ETSRelayerFactory = await ethers.getContractAt("ETSRelayerFactory", etsRelayerFactory.address);

  console.log("============ CONFIGURE ROLES & APPROVALS ============");

  await ETSAccessControls.grantRole(await ETSAccessControls.SMART_CONTRACT_ROLE(), accounts.ETSAdmin.address, {
    from: accounts.ETSAdmin.address,
  });
  console.log(`SMART_CONTRACT_ROLE granted to ETSPlatform.address (${accounts.ETSAdmin.address})`);

  // Grant RELAYER_ADMIN role to ETSRelayerFactory so it can deploy relayer contracts.
  await ETSAccessControls.grantRole(ethers.utils.id("RELAYER_ADMIN"), ETSRelayerFactory.address);
  console.log(`RELAYER_ADMIN granted to ETSRelayerFactory.address (${ETSRelayerFactory.address})`);

  await ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(ETSEnrichTarget.address);
  console.log(`ETSEnrichTarget contract set on ETSTarget`);

  // Approve auction house contract to move tokens owned by platform.
  await ETSToken.connect(accounts.ETSPlatform).setApprovalForAll(ETSAuctionHouse.address, true);
  console.log("ETSAuctionHouse granted ApprovalForAll on ETSToken");

  // Set ETS Core on ETSToken.
  await ETSToken.connect(accounts.ETSPlatform).setETSCore(ETS.address);
  console.log("ETS set on ETSToken.");

  // Add & Unpause ETSPlatform as a Relayer. for testing purposes.
  await ETSAccessControls.connect(accounts.ETSPlatform).addRelayer(accounts.ETSPlatform.address, "ETSPlatform");
  console.log("Authorize ETSPlatform wallet as a Relayer");
};

module.exports.tags = ["deployAll"];
module.exports.dependencies = ["ETSRelayerFactory"];
