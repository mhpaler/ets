const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

let accounts, hashtagAccessControls;

before("Setup test", async function () {
  const HashtagAccessControls = await ethers.getContractFactory("HashtagAccessControls");

  // See namedAccounts section of hardhat.config.js
  const namedAccounts = await ethers.getNamedSigners();

  accounts = {
    HashtagAdmin: namedAccounts["accountHashtagAdmin"],
    HashtagPublisher: namedAccounts["accountHashtagPublisher"],
    HashtagPlatform: namedAccounts["accountHashtagPlatform"],
  };

  hashtagAccessControls = await upgrades.deployProxy(HashtagAccessControls, { kind: "uups" });
});

describe("HashtagAccessControl", function () {
  describe("Validate setup/initialization", async function () {
    it("named account accountHashtagAdmin should be admin", async function () {
      expect(await hashtagAccessControls.isAdmin(accounts.HashtagAdmin.address)).to.be.equal(true);
    });
  });
});

describe("Publisher", async function () {
  it("should admin as contract creator", async function () {
    await hashtagAccessControls.grantRole(ethers.utils.id("PUBLISHER"), accounts.HashtagPublisher.address);
    expect(await hashtagAccessControls.isPublisher(accounts.HashtagPublisher.address)).to.be.equal(true);
  });
});
