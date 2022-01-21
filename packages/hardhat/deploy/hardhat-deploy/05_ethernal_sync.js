// const { ethers, ethernal } = require("hardhat");

// module.exports = async () => {
//   const ETSAdmin = await ethers.getNamedSigner("ETSAdmin");

//   // Fetch address of HashtagAccessControls.
//   const accessControls = await ethers.getContract("HashtagAccessControls", ETSAdmin);

//   // Fetch address of HashtagAccessControls.
//   const hashtagProtocol = await ethers.getContract("HashtagProtocol", ETSAdmin);

//   const ERC721HashtagRegistry = await ethers.getContract("ERC721HashtagRegistry", ETSAdmin);

//   await ethernal.push({
//     name: "HashtagAccessControls",
//     address: accessControls.address,
//   });

//   await ethernal.push({
//     name: "HashtagProtocol",
//     address: hashtagProtocol.address,
//   });

//   await ethernal.push({
//     name: "ERC721HashtagRegistry",
//     address: ERC721HashtagRegistry.address,
//   });
// };
// module.exports.tags = ["Ethernal"];
