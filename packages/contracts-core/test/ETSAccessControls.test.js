const {setup} = require("./setup.js");
const {ethers} = require("hardhat");
const {expect} = require("chai");

describe("ETSAccessControls Tests", function () {
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();
  });

  describe("Valid setup/initialization", async function () {
    it("grants ETSAdmin (deployer) the DEFAULT_ADMIN_ROLE role", async function () {
      expect(await contracts.ETSAccessControls.isAdmin(accounts.ETSAdmin.address)).to.be.equal(true);
    });

    it('sets ETSPlatform address as the "Platform"', async () => {
      expect(await contracts.ETSAccessControls.getPlatformAddress()).to.be.equal(accounts.ETSPlatform.address);
    });

    it("grants ETSPlatform the DEFAULT_ADMIN_ROLE", async function () {
      expect(await contracts.ETSAccessControls.isAdmin(accounts.ETSPlatform.address)).to.be.equal(true);
    });

    it("sets PUBLISHER_ADMIN as the role that can administer PUBLISHER role.", async () => {
      expect(await contracts.ETSAccessControls.getRoleAdmin(ethers.utils.id("PUBLISHER"))).to.be.equal(
        await ethers.utils.id("PUBLISHER_ADMIN"),
      );
    });

    it("adds ETSPlatform as a publisher", async function () {
      expect(await contracts.ETSAccessControls.isPublisher(accounts.ETSPlatform.address)).to.be.equal(true);
    });
  });

  describe("Platform address", async function () {
    it("can only be set by administrator", async function () {
      await expect(contracts.ETSAccessControls.connect(accounts.Buyer).setPlatform(accounts.RandomOne.address)).to.be
        .reverted;

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).setPlatform(accounts.RandomOne.address);
      expect(await contracts.ETSAccessControls.getPlatformAddress()).to.be.equal(accounts.RandomOne.address);
    });
  });

  describe("Publisher contracts", async function () {
    it("can only be added by administrator role.", async () => {
      // accounts.RandomOne tries to add target tagger.
      await expect(
        contracts.ETSAccessControls.connect(accounts.RandomOne).addPublisher(
          await contracts.ETSPublisher.getPublisherName(),
        ),
      ).to.be.reverted;

      // Add & enable ETSPublisher as a publisher contract.
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        contracts.ETSPublisher.address,
        await contracts.ETSPublisher.getPublisherName(),
      );
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(contracts.ETSPublisher.address)).to.be.equal(
        true,
      );
    });

    it("can't be overwritten (must be removed first).", async () => {
      // Add & enable ETSPublisher as a publisher contract.
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        contracts.ETSPublisher.address,
        await contracts.ETSPublisher.getPublisherName(),
      );

      await expect(
        contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
          contracts.ETSPublisher.address,
          await contracts.ETSPublisher.getPublisherName(),
        ),
      ).to.be.revertedWith("Publisher exists");
    });

    it("can only be removed by administrator", async () => {
      // Add & enable ETSPublisher as a publisher contract.
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        contracts.ETSPublisher.address,
        await contracts.ETSPublisher.getPublisherName(),
      );
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(contracts.ETSPublisher.address)).to.be.equal(
        true,
      );

      await expect(
        contracts.ETSAccessControls.connect(accounts.RandomOne).removePublisher(
          await contracts.ETSPublisher.getPublisherName(),
        ),
      ).to.be.reverted;

      // accounts.ETSPlatform removes
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).removePublisher(contracts.ETSPublisher.address);
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(contracts.ETSPublisher.address)).to.be.equal(
        false,
      );
    });

    it("can be paused/unpaused by Administrator", async () => {
      // Pause ETSPublisher
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        contracts.ETSPublisher.address,
        await contracts.ETSPublisher.getPublisherName(),
      );
      // Try pausing as random user.
      await expect(
        contracts.ETSAccessControls.connect(accounts.RandomOne).toggleIsPublisherPaused(contracts.ETSPublisher.address),
      ).to.be.reverted;

      await expect(
        contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(
          contracts.ETSPublisher.address,
        ),
      )
        .to.emit(contracts.ETSAccessControls, "PublisherPauseToggled")
        .withArgs(contracts.ETSPublisher.address);

      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(contracts.ETSPublisher.address)).to.be.equal(
        false,
      );

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(
        contracts.ETSPublisher.address,
      );
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(contracts.ETSPublisher.address)).to.be.equal(
        true,
      );
    });
  });

  describe("Third party Publisher contracts", async () => {
    beforeEach("Setup test", async () => {
      PublisherMock = await ethers.getContractFactory("PublisherMock", accounts.RandomOne);
      publisherMock = await PublisherMock.deploy(
        contracts.ETS.address,
        contracts.ETSToken.address,
        contracts.ETSTarget.address,
        accounts.RandomOne.address, // creator
        accounts.RandomTwo.address, // transfer to (new owner)
      );

      const tx = await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        publisherMock.address,
        "PublisherMock",
      );

      await expect(tx).to.emit(contracts.ETSAccessControls, "PublisherAdded").withArgs(publisherMock.address);
      expect(await contracts.ETSAccessControls.isPublisherByAddress(publisherMock.address)).to.be.equal(true);
      expect(await contracts.ETSAccessControls.isPublisher(publisherMock.address)).to.be.equal(true);
    });
    it("can be verified by address", async () => {
      expect(await contracts.ETSAccessControls.isPublisherByAddress(publisherMock.address)).to.be.equal(true);
    });
    it("can be verified by name", async () => {
      expect(await contracts.ETSAccessControls.isPublisherByName("PublisherMock")).to.be.equal(true);
    });
    it("can be paused & unpaused by ETS", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(
        await contracts.ETSAccessControls.publisherNameToContract("PublisherMock"),
      );

      expect(
        await contracts.ETSAccessControls.isPublisherAndNotPaused(
          await contracts.ETSAccessControls.publisherNameToContract("PublisherMock"),
        ),
      ).to.be.equal(false);
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(
        await contracts.ETSAccessControls.publisherNameToContract("PublisherMock"),
      );

      expect(
        await contracts.ETSAccessControls.isPublisherAndNotPaused(
          await contracts.ETSAccessControls.publisherNameToContract("PublisherMock"),
        ),
      ).to.be.equal(true);
    });
    it("can be removed by ETS", async () => {
      const tx = await contracts.ETSAccessControls.connect(accounts.ETSPlatform).removePublisher(publisherMock.address);
      await expect(tx).to.emit(contracts.ETSAccessControls, "PublisherRemoved").withArgs(publisherMock.address);
      expect(await contracts.ETSAccessControls.isPublisherByAddress(publisherMock.address)).to.be.equal(false);
      expect(await contracts.ETSAccessControls.isPublisherByName("PublisherMock")).to.be.equal(false);
      expect(await contracts.ETSAccessControls.isPublisher(publisherMock.address)).to.be.equal(false);
    });
    it("can be paused & unpaused by Owner", async () => {
      expect(await publisherMock.paused()).to.be.equal(false);

      // Try pausing as non-owner (eg. ETSPlatform)
      await expect(publisherMock.connect(accounts.ETSPlatform).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );

      // Now pause as the owner
      await expect(publisherMock.connect(accounts.RandomTwo).pause())
        .to.emit(publisherMock, "Paused")
        .withArgs(accounts.RandomTwo.address);

      await expect(publisherMock.connect(accounts.RandomTwo).unpause())
        .to.emit(publisherMock, "Unpaused")
        .withArgs(accounts.RandomTwo.address);
    });
  });
});
