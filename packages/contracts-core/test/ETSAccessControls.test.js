const { setup } = require("./setup.js");
const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

describe("ETSAccessControls Tests", function () {

  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();
  });

  describe("Valid setup/initialization", async function () {
    it("grants ETSAdmin (deployer) the DEFAULT_ADMIN_ROLE role", async function () {
      expect(await contracts.ETSAccessControls.isAdmin(accounts.ETSAdmin.address)).to.be.equal(true);
    });

    it("grants ETSPlatform the DEFAULT_ADMIN_ROLE", async function () {
      expect(await contracts.ETSAccessControls.isAdmin(accounts.ETSPlatform.address)).to.be.equal(true);
    });

    it("grants ETSPlatform the PUBLISHER role", async function () {
      expect(await contracts.ETSAccessControls.isPublisher(accounts.ETSPlatform.address)).to.be.equal(true);
    });

    it("grants ETSPlatform the PUBLISHER role", async function () {
      expect(await contracts.ETSAccessControls.isPublisher(accounts.ETSPlatform.address)).to.be.equal(true);
    });

    it("sets publisherDefaultThreshold", async function () {
      expect(await contracts.ETSAccessControls.getPublisherDefaultThreshold()).to.be.equal(initSettings.PUBLISHER_DEFAULT_THRESHOLD);
    });

    it("sets PUBLISHER_ADMIN as the role that can administer PUBLISHER role.", async () => {
      expect(
        await contracts.ETSAccessControls.getRoleAdmin(ethers.utils.id("PUBLISHER"))
      )
      .to.be.equal(
        await ethers.utils.id("PUBLISHER_ADMIN")
      );
    });

  });

  describe("Only administrator", async function () {
    it("should be able to set token", async function () {
      await expect(contracts.ETSAccessControls.connect(accounts.RandomOne)
        .setETSToken(contracts.ETSToken.address)).to.be.reverted;
  
      await expect(contracts.ETSAccessControls.connect(accounts.ETSPlatform)
        .setETSToken(contracts.ETSToken.address))
          .to.emit(
            contracts.ETSAccessControls, "ETSTokenSet"
          )
          .withArgs(
            contracts.ETSToken.address
          );
    });
    it("can set publisherDefaultThreshold", async function () {
      await expect(contracts.ETSAccessControls.connect(accounts.RandomOne)
        .setPublisherDefaultThreshold(10)).to.be.reverted;
  
      await expect(contracts.ETSAccessControls.connect(accounts.ETSPlatform)
        .setPublisherDefaultThreshold(10))
          .to.emit(
            contracts.ETSAccessControls, "PublisherDefaultThresholdSet"
          )
          .withArgs(
            10
          );
    });
  });
});