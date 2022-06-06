const { setup } = require("./setup.js");
const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

let accounts, factories, ETSAccessControls, ETSPublisherControls, ETSLifeCycleControls, ETSToken;

// describe("ETSToken publisher tests", function () {
//   // we create a setup function that can be called by every test and setup variable for easy to read tests
//   beforeEach("Setup test", async function () {
//     // See namedAccounts section of hardhat.config.js
//     const namedAccounts = await ethers.getNamedSigners();
//     const unnamedAccounts = await ethers.getUnnamedSigners();
//     accounts = {
//       ETSAdmin: namedAccounts["ETSAdmin"],
//       ETSPublisher: namedAccounts["ETSPublisher"],
//       ETSPlatform: namedAccounts["ETSPlatform"],
//       Buyer: unnamedAccounts[0],
//       RandomOne: unnamedAccounts[1],
//       RandomTwo: unnamedAccounts[2],
//       Creator: unnamedAccounts[3],
//     };
// 
//     factories = {
//       ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
//       ETSPublisherControls: await ethers.getContractFactory("ETSPublisherControls"),
//       ETSToken: await ethers.getContractFactory("ETSToken"),
//     };
// 
//     ETSAccessControls = await upgrades.deployProxy(factories.ETSAccessControls, { kind: "uups" });
//     ETSPublisherControls = await upgrades.deployProxy(
//       factories.ETSPublisherControls,
//      // [ETSAccessControls.address],
//       { kind: "uups" }
//     );
// 
//     ETSToken = await upgrades.deployProxy(
//       factories.ETSToken,
//       [
//         ETSAccessControls.address,
//         accounts.ETSPlatform.address
//       ],
//       { kind: "uups" },
//     );
// 
//     // add a publisher to the protocol
//     await ETSAccessControls.grantRole(
//       await ETSAccessControls.PUBLISHER_ROLE(),
//       accounts.ETSPublisher.address
//     );
// 
//     // Set up the publisher role admin; addresses with PUBLISHER_ROLE_ADMIN
//     // may grand / revoke publisher role on other addresses.
//     await ETSAccessControls.setRoleAdmin(
//       await ETSAccessControls.PUBLISHER_ROLE(),
//       await ETSAccessControls.PUBLISHER_ROLE_ADMIN(),
//       { from: accounts.ETSAdmin.address }
//     );
// 
//     // Give ETSPublisherControls PUBLISHER_ROLE_ADMIN role.
//     await ETSAccessControls.grantRole(
//       await ETSAccessControls.PUBLISHER_ROLE_ADMIN(), 
//       ETSPublisherControls.address
//     );
// 
//     await ETSAccessControls.grantRole(
//       await ETSAccessControls.PUBLISHER_ROLE_ADMIN(), 
//       ETSAccessControls.address
//     );
// 
//     await ETSAccessControls.grantRole(
//       await ETSAccessControls.SMART_CONTRACT_ROLE(),
//       accounts.ETSAdmin.address,
//       { from: accounts.ETSAdmin.address },
//     );
// 
//     await ETSPublisherControls.setETS(ETSToken.address);
// 
//   });
// 
//   describe("Validate setup", async function () {
// 
//     beforeEach(async function () {
// 
//       console.log("accounts.ETSPlatform", accounts.ETSPlatform.address);
//       console.log("accounts.RandomTwo", accounts.RandomTwo.address);
//       console.log("ETSAccessControls.address", ETSAccessControls.address);
//       console.log("ETSPublisherControls.address", ETSPublisherControls.address);
//       console.log("ETSToken.address", ETSToken.address);
//     });
// 
//     it("should have default configs", async function () {
// 
//       assert(await ETSAccessControls.getRoleAdmin(ethers.utils.id("PUBLISHER")) === ethers.utils.id("PUBLISHER_ADMIN"));
//       assert((await ETSAccessControls.isPublisherAdmin(ETSPublisherControls.address)) === true);
// 
//     });
//   });
// 
//   describe("Promotion to publisher role", async function () {
//     let tokenId;
// 
//     beforeEach(async function () {
// 
//       // console.log("accounts.ETSPlatform", accounts.ETSPlatform.address);
//       // console.log("accounts.RandomTwo", accounts.RandomTwo.address);
//       // console.log("ETSToken.address", ETSToken.address);
//       // console.log("ETSPublisherControls.address", ETSPublisherControls.address);
// 
//       // RandomTwo account creates a tag.
//       const tag = "#PublisherControls";
//       await ETSToken.connect(accounts.RandomTwo).createTag(tag, accounts.ETSPublisher.address);
//       tokenId = await ETSToken.computeTagId(tag);
// 
//     });
// 
//     it("is granted by platform when owner receives one tag", async function () {
// 
//       // Transfer tag away from platform.
//       await ETSToken.connect(accounts.ETSPlatform).transferFrom(
//         accounts.ETSPlatform.address,
//         accounts.RandomTwo.address,
//         tokenId
//       );
// 
//       assert((await ETSAccessControls.isPublisher(accounts.RandomTwo.address)) === true);
// 
// 
//     });
// 
//     it("cannot be granted by address without proper permissions", async function () {
// 
//       await ETSPublisherControls.connect(accounts.RandomOne).promoteToPublisher(accounts.RandomTwo.address);
//       assert((await ETSAccessControls.isPublisher(accounts.RandomTwo.address)) === true);
// 
//       // Transfer tag away from platform.
//       //await ETSToken.connect(accounts.ETSPlatform).transferFrom(
//       //  accounts.ETSPlatform.address,
//       //  accounts.RandomTwo.address,
//       //  tokenId
//       //);
// 
//     });
// 
//   });
//   
// });
