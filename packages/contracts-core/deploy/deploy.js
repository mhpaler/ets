const {ethers} = require("hardhat");

module.exports = async ({deployments}) => {
  const {ETSAdmin, ETSPlatform} = await ethers.getNamedSigners();
  const deployer = ETSAdmin.address;

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
  const etsTargetTagger = await deployments.get("ETSTargetTagger");
  const ETSTargetTagger = await ethers.getContractAt("ETSTargetTagger", etsTargetTagger.address);

  console.log("============ CONFIGURE ROLES & APPROVALS ============");

  await ETSAccessControls.grantRole(await ETSAccessControls.SMART_CONTRACT_ROLE(), accounts.ETSAdmin.address, {
    from: accounts.ETSAdmin.address,
  });
  console.log(`SMART_CONTRACT_ROLE granted to ETSPlatform.address (${ETSPlatform.address})`);

  // Set Core Dev Team address as "platform" address. In production this will be a multisig.
  await ETSAccessControls.setPlatform(accounts.ETSPlatform.address);

  // Grant DEFAULT_ADMIN_ROLE to platform address. This platform address full administrator privileges.
  await ETSAccessControls.grantRole(await ETSAccessControls.DEFAULT_ADMIN_ROLE(), accounts.ETSPlatform.address, {
    from: deployer,
  });
  console.log(`DEFAULT_ADMIN_ROLE role granted to ETSPlatform.address (${ETSPlatform.address})`);

  // Grant PUBLISHER role to platform, cause sometimes the platform will act as publisher.
  await ETSAccessControls.grantRole(ethers.utils.id("PUBLISHER"), accounts.ETSPlatform.address, {
    from: deployer,
  });
  console.log(`PUBLISHER role granted to ${ETSPlatform.address}`);

  // Set PUBLISHER role admin role. Contracts or addresses given PUBLISHER_ADMIN role can grant PUBLISHER role.
  await ETSAccessControls.setRoleAdmin(ethers.utils.id("PUBLISHER"), ethers.utils.id("PUBLISHER_ADMIN"), {
    from: deployer,
  });
  console.log("PUBLISHER_ADMIN set as role admin for PUBLISHER");

  // Grant PUBLISHER_ADMIN role to ETSAccessControls contract so it can grant publisher role all on its own.
  await ETSAccessControls.grantRole(ethers.utils.id("PUBLISHER_ADMIN"), ETSAccessControls.address);

  // Grant PUBLISHER role to platform, cause sometimes the platform will act as publisher.
  await ETSAccessControls.grantRole(ethers.utils.id("PUBLISHER_ADMIN"), accounts.ETSPlatform.address);

  // Set token access controls.
  await ETSAccessControls.connect(accounts.ETSPlatform).setETSToken(ETSToken.address);
  console.log(`ETSToken set on ETSAccessControls ${ETSToken.address}`);

  await ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(ETSEnrichTarget.address);

  // Approve auction house contract to move tokens owned by platform.
  await ETSToken.connect(accounts.ETSPlatform).setApprovalForAll(ETSAuctionHouse.address, true);
  console.log("ETSAuctionHouse granted ApprovalForAll on ETSToken");

  // Add & Enable ETSTargetTagger as a Target Tagger.
  await ETSAccessControls.connect(accounts.ETSPlatform).addTargetTagger(
    ETSTargetTagger.address,
    await ETSTargetTagger.getTaggerName(),
  );
  console.log("Authorize ETSTargetTagger as a Target Tagger");
};

module.exports.tags = ["deployAll"];
module.exports.dependencies = ["ETSTargetTagger"];
