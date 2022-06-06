const { ethers, upgrades } = require("hardhat");
const { expect, assert } = require("chai");
const { BigNumber, constants } = ethers;

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
      ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
      ETSAuctionHouse: await ethers.getContractFactory("ETSAuctionHouse"),
      ETSToken: await ethers.getContractFactory("ETSToken"),
    };

    const ETSAccessControls = await upgrades.deployProxy(factories.ETSAccessControls, { kind: "uups" });
    const ETSToken = await upgrades.deployProxy(
      factories.ETSToken,
      [ETSAccessControls.address, accounts.ETSPlatform.address],
      { kind: "uups" },
    );

    const ETSAuctionHouse = await upgrades.deployProxy(
      factories.ETSToken,
      [ETSAccessControls.address, accounts.ETSPlatform.address],
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

    return [accounts, ETSAccessControls, ETSToken];
}

module.exports = {
  setup
};