const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

const tokenAbi = require("../abi/contracts/ETSToken.sol/ETSToken.json");
async function setup() {

  const namedAccounts = await ethers.getNamedSigners();
    const unnamedAccounts = await ethers.getUnnamedSigners();
    const accounts = {
      ETSAdmin: namedAccounts["ETSAdmin"],
      ETSPublisher: namedAccounts["ETSPublisher"],
      ETSPlatform: namedAccounts["ETSPlatform"],
      Buyer: unnamedAccounts[0],
      RandomOne: unnamedAccounts[1],
      RandomTwo: unnamedAccounts[2],
      Creator: unnamedAccounts[3],
    };

    const factories = {
      WETH: await ethers.getContractFactory("WETH"),
      ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
      ETSAuctionHouse: await ethers.getContractFactory("ETSAuctionHouse"),
      ETSToken: await ethers.getContractFactory("ETSToken"),
    };

    const WETH = await factories.WETH.deploy();
    const ETSAccessControls = await upgrades.deployProxy(factories.ETSAccessControls, { kind: "uups" });
    let ETSToken = await upgrades.deployProxy(
      factories.ETSToken,
      [ETSAccessControls.address, accounts.ETSPlatform.address],
      { kind: "uups" },
    );

    ETSToken = new ethers.Contract(ETSToken.address, tokenAbi, accounts.ETSAdmin);

    const ETSAuctionHouse = await upgrades.deployProxy(
      factories.ETSAuctionHouse,
      [
        ETSToken.address,
        ETSAccessControls.address,
        WETH.address,      // _weth
        30,                 // _timeBuffer (30 secs)
        1,                  // _reservePrice in wei
        5,                  // _minBidIncrementPercentage,
        60 * 2              // _duration (2 mins)
      ],
      { kind: "uups" },
    );

    await ETSAccessControls.grantRole(
      await ETSAccessControls.SMART_CONTRACT_ROLE(),
      accounts.ETSAdmin.address,
      { from: accounts.ETSAdmin.address },
    );

    // add a publisher to the protocol
    await ETSAccessControls.grantRole(ethers.utils.id("PUBLISHER"), accounts.ETSPublisher.address);
    assert((await ETSAccessControls.isAdmin(accounts.ETSAdmin.address)) === true);

    return [accounts, ETSAccessControls, ETSToken, ETSAuctionHouse];
}

module.exports = {
  setup
};