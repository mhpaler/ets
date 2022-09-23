const {setup} = require("./setup.js");
const {ethers} = require("hardhat");
const {expect} = require("chai");

describe("ETSPublisherFactory Tests", function () {
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();
  });

  describe("Valid setup/initialization", async function () {
    it("sets PUBLISHER_ADMIN as the role that can administer PUBLISHER role.", async () => {
      expect(await contracts.ETSAccessControls.getRoleAdmin(ethers.utils.id("PUBLISHER"))).to.be.equal(
        await ethers.utils.id("PUBLISHER_ADMIN"),
      );
    });

    it("grants ETSPublisherFactory the PUBLISHER_ADMIN role", async function () {
      expect(await contracts.ETSAccessControls.isPublisherAdmin(contracts.ETSPublisherFactory.address)).to.be.equal(
        true,
      );
    });
  });

  describe("New publishers", async function () {
    it("can only be added by factory with PUBLISHER_ROLE_ADMIN role.", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).revokeRole(
        ethers.utils.id("PUBLISHER_ADMIN"),
        contracts.ETSPublisherFactory.address,
      );

      await expect(contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1("Uniswap")).to.be.reverted;

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).grantRole(
        ethers.utils.id("PUBLISHER_ADMIN"),
        contracts.ETSPublisherFactory.address,
      );

      const tx = await contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1("Uniswap");
      await expect(tx).to.emit(contracts.ETSAccessControls, "PublisherAdded");
    });

    it("Revert if name is too short", async () => {
      await expect(contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1("X")).to.be.revertedWith(
        "Publisher name too short",
      );
    });

    it("Revert if name is too long", async () => {
      await expect(
        contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1(
          "this is a publisher name that is well well well well over the limit in length",
        ),
      ).to.be.revertedWith("Publisher name too long");
    });

    it("Revert if name already exists", async () => {
      await contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1("Uniswap");

      await expect(
        contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1("Uniswap"),
      ).to.be.revertedWith("Publisher name exists");
    });

    it("will emit PublisherAdded", async () => {
      const tx = await contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1("Uniswap");
      await expect(tx).to.emit(contracts.ETSAccessControls, "PublisherAdded");
    });

    it("are not paused when added", async () => {
      const tx = await contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1("Uniswap");
      const publisherAddress = contracts.ETSAccessControls.getPublisherAddressFromName("Uniswap");
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(publisherAddress)).to.be.equal(true);
    });

    it("can be paused/unpaused by Administrator", async () => {
      await contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1("Uniswap");

      // Try pausing by non-administrator account.
      const publisherAddress = await contracts.ETSAccessControls.getPublisherAddressFromName("Uniswap");
      await expect(contracts.ETSAccessControls.connect(accounts.RandomOne).toggleIsPublisherPaused(publisherAddress)).to
        .be.reverted;

      await expect(contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(publisherAddress))
        .to.emit(contracts.ETSAccessControls, "PublisherPauseToggled")
        .withArgs(publisherAddress);

      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(publisherAddress)).to.be.equal(false);

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsPublisherPaused(publisherAddress);
      expect(await contracts.ETSAccessControls.isPublisherAndNotPaused(publisherAddress)).to.be.equal(true);
    });
  });

  describe("Active publisher contracts", async () => {
    beforeEach("Setup test", async () => {
      await contracts.ETSPublisherFactory.connect(accounts.RandomOne).addPublisherV1("Uniswap");
      publisherAddress = await contracts.ETSAccessControls.getPublisherAddressFromName("Uniswap");
      etsPublisherV1ABI = require("../abi/contracts/publishers/ETSPublisherV1.sol/ETSPublisherV1.json");
      // Connect with owner account
      uniswapPublisher = new ethers.Contract(publisherAddress, etsPublisherV1ABI, accounts.RandomOne);
    });

    it("can be verified by address", async () => {
      expect(await contracts.ETSAccessControls.isPublisherByAddress(publisherAddress)).to.be.equal(true);
      expect(await contracts.ETSAccessControls.isPublisher(publisherAddress)).to.be.equal(true);
    });

    it("can be verified by name", async () => {
      expect(await contracts.ETSAccessControls.isPublisherByName("Uniswap")).to.be.equal(true);
    });

    it("can be paused & unpaused by Owner", async () => {
      expect(await uniswapPublisher.paused()).to.be.equal(false);
      expect(await uniswapPublisher.isPausedByOwner()).to.be.equal(false);

      // Now pause as the owner
      expect(await uniswapPublisher.pause())
        .to.emit(publisherAddress, "Paused")
        .withArgs(accounts.RandomOne.address);

      expect(await uniswapPublisher.unpause())
        .to.emit(publisherAddress, "Unpaused")
        .withArgs(accounts.RandomOne.address);
    });

    it("will revert if non-owner attempts to pause", async () => {
      // Try pausing as non-owner (eg. RandomTwo)
      uniswapPublisher2 = new ethers.Contract(publisherAddress, etsPublisherV1ABI, accounts.RandomTwo);
      await expect(uniswapPublisher2.pause()).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
