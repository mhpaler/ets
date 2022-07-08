const {setup} = require("./setup.js");
const {ethers, upgrades} = require("hardhat");
const {expect, assert} = require("chai");
const {BigNumber, constants} = ethers;

describe("ETSToken grant/revoke publisher role tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();

    // Mint a couple tags
    tag1 = "#Love";
    await contracts.ETSToken.connect(accounts.ETSPlatform).createTag(tag1, accounts.RandomTwo.address);
    tag1Id = await contracts.ETSToken.computeTagId(tag1);
    tag1Id = tag1Id.toString();

    // Mint a tag and transfer away from platform.
    tag2 = "#Incredible";
    await contracts.ETSToken.connect(accounts.ETSPlatform).createTag(tag2, accounts.RandomTwo.address);
    tag2Id = await contracts.ETSToken.computeTagId(tag2);
    tag2Id = tag2Id.toString();
  });

  describe("Granting publisher role", async function () {
    it("reverts if ETSAccessControls does not have PUBLISHER_ADMIN role", async () => {
      // Note: ETSAccessControls is granted PUBLISHER_ADMIN by default in setup.js
      // so revoking will make transfer revert.
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).revokeRole(
        ethers.utils.id("PUBLISHER_ADMIN"),
        contracts.ETSAccessControls.address,
      );

      const tx = contracts.ETSAccessControls.connect(accounts.RandomTwo).togglePublisher();
      await expect(tx).to.be.reverted;
    });

    it("Succeeds if ETSAccessControls has PUBLISHER_ADMIN role", async () => {
      const tx = contracts.ETSAccessControls.connect(accounts.RandomTwo).togglePublisher();

      await expect(tx)
        .to.emit(contracts.ETSAccessControls, "RoleGranted")
        .withArgs(ethers.utils.id("PUBLISHER"), accounts.RandomTwo.address, contracts.ETSAccessControls.address);
    });

    it("toggles as expected", async () => {
      let tx = contracts.ETSAccessControls.connect(accounts.RandomTwo).togglePublisher();

      await expect(tx)
        .to.emit(contracts.ETSAccessControls, "RoleGranted")
        .withArgs(ethers.utils.id("PUBLISHER"), accounts.RandomTwo.address, contracts.ETSAccessControls.address);

      tx = contracts.ETSAccessControls.connect(accounts.RandomTwo).togglePublisher();
      await expect(tx)
        .to.emit(contracts.ETSAccessControls, "RoleRevoked")
        .withArgs(ethers.utils.id("PUBLISHER"), accounts.RandomTwo.address, contracts.ETSAccessControls.address);
    });
  });

  describe("With publisherDefaultThreshold (tags required) set to 1", async function () {
    beforeEach("Setup test", async function () {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).setPublisherDefaultThreshold(1);
    });
    it("should not grant publisher role if sender has no tags", async function () {
      await contracts.ETSAccessControls.connect(accounts.RandomTwo).togglePublisher();
      expect(await contracts.ETSAccessControls.isPublisher(accounts.RandomTwo.address)).to.be.equal(false);
    });
    it("should grant publisher role if sender has one tag", async function () {
      // transfer token to owner to simulate a purchase.
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tag1Id,
      );
      await contracts.ETSAccessControls.connect(accounts.RandomTwo).togglePublisher();
      expect(await contracts.ETSAccessControls.isPublisher(accounts.RandomTwo.address)).to.be.equal(true);
    });
    it("should preserve publisher role if publisher sells tag", async function () {
      // transfer token to owner to simulate a purchase.
      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomTwo.address,
        tag1Id,
      );
      await contracts.ETSAccessControls.connect(accounts.RandomTwo).togglePublisher();
      expect(await contracts.ETSAccessControls.isPublisher(accounts.RandomTwo.address)).to.be.equal(true);

      await contracts.ETSToken.connect(accounts.RandomTwo).transferFrom(
        accounts.RandomTwo.address,
        accounts.ETSPlatform.address,
        tag1Id,
      );
      expect(await contracts.ETSAccessControls.isPublisher(accounts.RandomTwo.address)).to.be.equal(true);
    });
  });
});
