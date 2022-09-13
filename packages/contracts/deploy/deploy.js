const {ethers} = require("hardhat");
const {setup} = require("./setup.js");

module.exports = async ({deployments}) => {
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
  const etsPublisherFactory = await deployments.get("ETSPublisherFactory");
  const ETSPublisherFactory = await ethers.getContractAt("ETSPublisherFactory", etsPublisherFactory.address);

  console.log("============ CONFIGURE ROLES & APPROVALS ============");

  await ETSAccessControls.grantRole(await ETSAccessControls.SMART_CONTRACT_ROLE(), accounts.ETSAdmin.address, {
    from: accounts.ETSAdmin.address,
  });
  console.log(`SMART_CONTRACT_ROLE granted to ETSPlatform.address (${accounts.ETSAdmin.address})`);

  // Grant PUBLISHER_ADMIN role to ETSPublisherFactory so it can deploy publisher contracts.
  await ETSAccessControls.grantRole(ethers.utils.id("PUBLISHER_ADMIN"), ETSPublisherFactory.address);
  console.log(`PUBLISHER_ADMIN granted to ETSPublisherFactory.address (${ETSPublisherFactory.address})`);

  await ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(ETSEnrichTarget.address);
  console.log(`ETSEnrichTarget contract set on ETSTarget`);

  // Approve auction house contract to move tokens owned by platform.
  await ETSToken.connect(accounts.ETSPlatform).setApprovalForAll(ETSAuctionHouse.address, true);
  console.log("ETSAuctionHouse granted ApprovalForAll on ETSToken");

  // Set ETS Core on ETSToken.
  await ETSToken.connect(accounts.ETSPlatform).setETSCore(ETS.address);
  console.log("ETS set on ETSToken.");

  // Add & Unpause ETSPlatform as a Publisher. for testing purposes.
  await ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(accounts.ETSPlatform.address, "ETSPlatform");
  console.log("Authorize ETSPlatform wallet as a Publisher");
};

module.exports.tags = ["deployAll"];
// module.exports.dependencies = ["ETSPublisherFactory"];
