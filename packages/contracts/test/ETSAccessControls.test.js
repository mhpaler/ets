const {setup} = require("./setup.js");
const {ethers} = require("hardhat");
const {expect} = require("chai");

describe("ETSAccessControls Tests", function () {
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();

    // ETSPublisher is deployed globally for all tests,
    // so let's deploy a mock for testing access controls.
    PublisherMock = await ethers.getContractFactory("PublisherMock", accounts.RandomOne);
    publisherMock = await PublisherMock.deploy(
      contracts.ETS.address,
      contracts.ETSToken.address,
      contracts.ETSTarget.address,
      accounts.RandomOne.address, // creator
      accounts.RandomTwo.address, // transfer to (new owner)
    );
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
  });

  describe("Platform address", async function () {
    it("can only be set by administrator", async function () {
      await expect(contracts.ETSAccessControls.connect(accounts.Buyer).setPlatform(accounts.RandomOne.address)).to.be
        .reverted;

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).setPlatform(accounts.RandomOne.address);
      expect(await contracts.ETSAccessControls.getPlatformAddress()).to.be.equal(accounts.RandomOne.address);
    });
  });

  describe("New publishers", async function () {
    it("can only be added by PUBLISHER_ROLE_ADMIN role.", async () => {
      // accounts.RandomOne tries to add Publisher.
      await expect(
        contracts.ETSAccessControls.connect(accounts.RandomOne).addPublisher(
          publisherMock.address,
          await publisherMock.getPublisherName(),
        ),
      ).to.be.reverted;

      const tx = await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        publisherMock.address,
        await publisherMock.getPublisherName(),
      );
      await expect(tx).to.emit(contracts.ETSAccessControls, "PublisherAdded").withArgs(publisherMock.address, false);
    });

    it("can be a wallet address if that address has ETSAdministrator role", async () => {
      // Having a wallet as a publisher is ONLY for making testing core functions easier.
      await expect(
        contracts.ETSAccessControls.connect(accounts.RandomOne).addPublisher(accounts.RandomOne.address, "RandomOne"),
      ).to.be.reverted;

      // RandomOne wallet MUST have PUBLISHER_ROLE_ADMIN in order to be added as publisher.
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).grantRole(
        await contracts.ETSAccessControls.PUBLISHER_ROLE_ADMIN(),
        accounts.RandomOne.address,
      );

      // RandomOne adds itself as a publisher.
      const tx = await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        accounts.RandomOne.address,
        "RandomOne",
      );
      await expect(tx)
        .to.emit(contracts.ETSAccessControls, "PublisherAdded")
        .withArgs(accounts.RandomOne.address, true);
    });

    it("are not paused when added", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        publisherMock.address,
        await publisherMock.getPublisherName(),
      );

      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(publisherMock.address)).to.be.equal(true);
    });

    it("must implement IETSPublisher interface.", async () => {
      // Trying to add wallet address as publisher.
      await expect(
        contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(accounts.RandomOne.address, "Random"),
      ).to.be.reverted;
    });

    it("must have unique address.", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        publisherMock.address,
        await publisherMock.getPublisherName(),
      );

      await expect(
        contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
          publisherMock.address,
          "Duplicate address",
        ),
      ).to.be.revertedWith("Publisher exists");
    });

    it("can be paused/unpaused by Administrator", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        publisherMock.address,
        await publisherMock.getPublisherName(),
      );
      // Try unpausing by non-administrator account.
      await expect(
        contracts.ETSAccessControls.connect(accounts.RandomOne).toggleIsPublisherPaused(publisherMock.address),
      ).to.be.reverted;

      await expect(
        contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(publisherMock.address),
      )
        .to.emit(contracts.ETSAccessControls, "PublisherPauseToggled")
        .withArgs(publisherMock.address);

      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(publisherMock.address)).to.be.equal(false);

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(publisherMock.address);
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(publisherMock.address)).to.be.equal(true);
    });
  });

  describe("Active publisher contracts", async () => {
    beforeEach("Setup test", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addPublisher(
        publisherMock.address,
        "PublisherMock",
      );
    });
    it("can be verified by address", async () => {
      expect(await contracts.ETSAccessControls.isPublisherByAddress(publisherMock.address)).to.be.equal(true);
      expect(await contracts.ETSAccessControls.isPublisher(publisherMock.address)).to.be.equal(true);
    });
    it("can be verified by name", async () => {
      expect(await contracts.ETSAccessControls.isPublisherByName("PublisherMock")).to.be.equal(true);
    });
    it("can be paused & unpaused by Owner", async () => {
      expect(await publisherMock.paused()).to.be.equal(false);
      expect(await publisherMock.isPausedByOwner()).to.be.equal(false);

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
