const { ethers } = require("hardhat");

module.exports = async ({
  deployments
}) => {
    const { ETSAdmin, ETSPlatform } = await ethers.getNamedSigners();
    const deployer = ETSAdmin.address;

    const etsAccessControls = await deployments.get("ETSAccessControls");
    const ETSAccessControls = await ethers.getContractAt("ETSAccessControls", etsAccessControls.address);
    const etsToken = await deployments.get("ETSToken");
    const ETSToken = await ethers.getContractAt("ETSToken", etsToken.address);
    const etsAuctionHouse = await deployments.get("ETSAuctionHouse");
    const ETSAuctionHouse = await ethers.getContractAt("ETSAuctionHouse", etsAuctionHouse.address);

    console.log("============ CONFIGURE ROLES & APPROVALS ============");

    await ETSAccessControls.grantRole(
      await ETSAccessControls.SMART_CONTRACT_ROLE(),
      ETSPlatform.address,
      { from: deployer }
    );
    console.log(`Smart contract role granted to ETSPlatform.address (${ ETSPlatform.address })`);

    // Grant DEFAULT_ADMIN_ROLE to platform
    // Plan here is to transfer admin control to
    // platform multisig after deployment 
    await ETSAccessControls.grantRole(
      await ETSAccessControls.DEFAULT_ADMIN_ROLE(),
      ETSPlatform.address,
      { from: deployer }
    );
    console.log(`DEFAULT_ADMIN_ROLE role granted to ETSPlatform.address (${ ETSPlatform.address })`);

    // Grant PUBLISHER role to platform
    await ETSAccessControls.grantRole(
      ethers.utils.id("PUBLISHER"),
      ETSPlatform.address,
      { from: deployer }
    );
    console.log(`PUBLISHER role granted to ${ ETSPlatform.address }`);
//
//    // Grant PUBLISHER role to ETS owned address
//    // Consider only using platform address as ETS publisher.
//    // await ETSAccessControls.grantRole(
//    //   ethers.utils.id("PUBLISHER"),
//    //   ETSPublisher,
//    //   { from: deployer }
//    // );
//
    // Set PUBLISHER role admin.
    // Contracts or addresses given PUBLISHER_ADMIN role
    // can grant PUBLISHER role. This role
    // should be given to ETSToken so it can
    // grant PUBLISHER role.
    await ETSAccessControls.setRoleAdmin(
      ethers.utils.id("PUBLISHER"),
      ethers.utils.id("PUBLISHER_ADMIN"),
      { from: deployer }
    );
    console.log("PUBLISHER_ADMIN set as role admin for PUBLISHER");

    // Grant PUBLISHER_ADMIN role to ETSToken contract
    await ETSAccessControls.grantRole(
      ethers.utils.id("PUBLISHER_ADMIN"),
      ETSToken.address,
      { from: deployer }
    );
    console.log(`PUBLISHER_ADMIN role granted to ${ ETSToken.address }`);

    // Set token access controls.
    await ETSAccessControls.connect(ETSPlatform)
      .setETSToken(ETSToken.address);
    console.log(`ETSToken set on ETSAccessControls ${ ETSToken.address }`);

    // Approve auction house contract to move tokens owned by platform.
    await ETSToken.connect(ETSPlatform)
      .setApprovalForAll(ETSAuctionHouse.address, true);
    console.log("ETSAuctionHouse granted ApprovalForAll on ETSToken");

};

module.exports.tags = ['deployAll'];
module.exports.dependencies = ['ETSAuctionHouse']
