const { ethers } = require("hardhat");
const { setup } = require("./setup.ts");

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

  // Allows relayer admin role to grant relayer factory role.
  await ETSAccessControls.setRoleAdmin(await ETSAccessControls.RELAYER_FACTORY_ROLE(), await ETSAccessControls.RELAYER_ADMIN_ROLE());

  // Allows relayer factory role to grant relayer role.
  await ETSAccessControls.setRoleAdmin(await ETSAccessControls.RELAYER_ROLE(), await ETSAccessControls.RELAYER_FACTORY_ROLE());

  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), accounts.ETSAdmin.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), accounts.ETSPlatform.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), ETSAccessControls.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_ADMIN_ROLE(), ETSToken.address);

  // Set auction oracle to platform just for testing.
  await ETSAccessControls.grantRole(await ETSAccessControls.AUCTION_ORACLE_ROLE(), accounts.ETSPlatform.address);
  await ETSAccessControls.grantRole(await ETSAccessControls.SMART_CONTRACT_ROLE(), accounts.ETSAdmin.address);

  await ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(ETSEnrichTarget.address);

  // Approve auction house contract to move tokens owned by platform.
  await ETSToken.connect(accounts.ETSPlatform).setApprovalForAll(ETSAuctionHouse.address, true);

  // Set ETS Core on ETSToken.
  await ETSToken.connect(accounts.ETSPlatform).setETSCore(ETS.address);

  // Grant RELAYER_FACTORY_ROLE to ETSRelayerFactory so it can deploy relayer contracts.
  await ETSAccessControls.grantRole(await ETSAccessControls.RELAYER_FACTORY_ROLE(), ETSRelayerFactory.address);

  // Add a relayer proxy for use in tests. Note: ETSPlatform not required to own CTAG to add relayer.
  await ETSRelayerFactory.connect(accounts.ETSPlatform).addRelayer("ETSRelayer");
};

module.exports.tags = ["deployAll"];
//module.exports.dependencies = ["ETSAccessControls"];

module.exports.dependencies = ["ETSRelayerFactory"];
