const { setup } = require("./setup.js");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ETSRelayerFactory Tests", function () {
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();

    // In these tests, adding a relayer is done by a random user (randomOne), so that user must own a CTAG.
    // Create a tag and transfer it to RandomOne
    const tag = "#LOVE";
    await contracts.ETSRelayer.connect(accounts.RandomTwo).getOrCreateTagIds([tag]);
    tokenId = await contracts.ETSToken.computeTagId(tag);
    await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
      accounts.ETSPlatform.address,
      accounts.RandomOne.address,
      tokenId,
    );

    const tag2 = "#HATE";
    await contracts.ETSRelayer.connect(accounts.RandomTwo).getOrCreateTagIds([tag2]);
    tokenId2 = await contracts.ETSToken.computeTagId(tag2);
    await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
      accounts.ETSPlatform.address,
      accounts.RandomOne.address,
      tokenId2,
    );
  });

  describe("Valid setup/initialization", async function () {
    it("sets RELAYER_ADMIN_ROLE as the role that can administer RELAYER_ROLE role.", async () => {
      expect(await contracts.ETSAccessControls.getRoleAdmin(ethers.utils.id("RELAYER_ROLE"))).to.be.equal(
        await ethers.utils.id("RELAYER_FACTORY_ROLE"),
      );
    });

    it("Enables ETSRelayerFactory as a relayer factory.", async function () {
      expect(await contracts.ETSAccessControls.isRelayerFactory(contracts.ETSRelayerFactory.address)).to.be.equal(true);
    });
  });

  describe("New relayers", async function () {
    it("can only be added by if factory has correct role.", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).revokeRole(
        ethers.utils.id("RELAYER_FACTORY_ROLE"),
        contracts.ETSRelayerFactory.address,
      );

      await expect(contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap")).to.be.reverted;

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).grantRole(
        ethers.utils.id("RELAYER_FACTORY_ROLE"),
        contracts.ETSRelayerFactory.address,
      );

      const tx = await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap");
      await expect(tx).to.emit(contracts.ETSAccessControls, "RelayerAdded");
    });

    it("can only be added if sender owns a CTAG.", async () => {
      await contracts.ETSToken.connect(accounts.RandomOne).transferFrom(
        accounts.RandomOne.address,
        accounts.ETSPlatform.address,
        tokenId,
      );

      await contracts.ETSToken.connect(accounts.RandomOne).transferFrom(
        accounts.RandomOne.address,
        accounts.ETSPlatform.address,
        tokenId2,
      );

      await expect(contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap")).to.be.revertedWith(
        "Must own CTAG",
      );

      await contracts.ETSToken.connect(accounts.ETSPlatform).transferFrom(
        accounts.ETSPlatform.address,
        accounts.RandomOne.address,
        tokenId,
      );

      const tx = await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap");
      await expect(tx).to.emit(contracts.ETSAccessControls, "RelayerAdded");
    });

    it("will revert if name is too short", async () => {
      await expect(contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("X")).to.be.revertedWith(
        "Relayer name too short",
      );
    });

    it("will revert if name is too long", async () => {
      await expect(
        contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer(
          "this is a relayer name that is well well well well over the limit in length",
        ),
      ).to.be.revertedWith("Relayer name too long");
    });

    it("will revert if name already exists", async () => {
      await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap");

      await expect(contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap")).to.be.revertedWith(
        "Relayer name exists",
      );
    });

    it("will emit RelayerAdded", async () => {
      const tx = await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap");
      await expect(tx).to.emit(contracts.ETSAccessControls, "RelayerAdded");
    });

    it("are not paused when added", async () => {
      const tx = await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap");
      const relayerAddress = contracts.ETSAccessControls.getRelayerAddressFromName("Uniswap");
      expect(await contracts.ETSAccessControls.isRelayerAndNotPaused(relayerAddress)).to.be.equal(true);
    });
  });

  describe("Active relayer contracts", async () => {
    beforeEach("Setup active relayer tests", async () => {
      await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap");
      relayerAddress = await contracts.ETSAccessControls.getRelayerAddressFromName("Uniswap");
      etsRelayerV1ABI = require("../abi/contracts/relayers/ETSRelayerV1.sol/ETSRelayerV1.json");
      // Connect with owner account
      uniswapRelayer = new ethers.Contract(relayerAddress, etsRelayerV1ABI, accounts.RandomOne);
    });

    it("can be looked up by address", async () => {
      expect(await contracts.ETSAccessControls.isRelayerByAddress(relayerAddress)).to.be.equal(true);
      expect(await contracts.ETSAccessControls.isRelayer(relayerAddress)).to.be.equal(true);
    });

    it("can be looked up by name", async () => {
      expect(await contracts.ETSAccessControls.isRelayerByName("Uniswap")).to.be.equal(true);
    });

    it("can be locked/unlocked by Platform", async () => {
      // Try pausing by non-administrator account.
      const relayerAddress = await contracts.ETSAccessControls.getRelayerAddressFromName("Uniswap");
      await expect(contracts.ETSAccessControls.connect(accounts.RandomOne).toggleRelayerLock(relayerAddress)).to.be
        .reverted;

      await expect(contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleRelayerLock(relayerAddress))
        .to.emit(contracts.ETSAccessControls, "RelayerLockToggled")
        .withArgs(relayerAddress);

      expect(await contracts.ETSAccessControls.isRelayerLocked(relayerAddress)).to.be.equal(true);

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleRelayerLock(relayerAddress);
      expect(await contracts.ETSAccessControls.isRelayerLocked(relayerAddress)).to.be.equal(false);
    });

    it("are paused by Platform if relayer is transferred to new owner with no CTAGS", async () => {
      // TODO
      //
    });

    it("cannot be paused by non-owner or non-relayer admin", async () => {
      // Try pausing as non-owner (eg. RandomTwo)
      uniswapRelayer = new ethers.Contract(relayerAddress, etsRelayerV1ABI, accounts.RandomTwo);
      await expect(uniswapRelayer.pause()).to.be.revertedWith("Caller not relayer admin");
    });

    it("can be paused & unpaused by Owner", async () => {
      expect(await uniswapRelayer.paused()).to.be.equal(false);
      expect(await uniswapRelayer.isPaused()).to.be.equal(false);

      // Now pause as the owner
      expect(await uniswapRelayer.pause())
        .to.emit(relayerAddress, "Paused")
        .withArgs(accounts.RandomOne.address);

      expect(await uniswapRelayer.unpause())
        .to.emit(relayerAddress, "Unpaused")
        .withArgs(accounts.RandomOne.address);
    });

    it("can be paused & unpaused by Platform (Relayer Admin)", async () => {
      expect(await uniswapRelayer.paused()).to.be.equal(false);
      expect(await uniswapRelayer.isPaused()).to.be.equal(false);

      // Now pause as the owner
      expect(await uniswapRelayer.connect(accounts.ETSPlatform).pause())
        .to.emit(relayerAddress, "Paused")
        .withArgs(accounts.ETSPlatform.address);

      expect(await uniswapRelayer.connect(accounts.ETSPlatform).unpause())
        .to.emit(relayerAddress, "Unpaused")
        .withArgs(accounts.ETSPlatform.address);
    });

    it("can be locked/unlocked by Platform", async () => {
      expect(await contracts.ETSAccessControls.isRelayerLocked(relayerAddress)).to.be.equal(false);

      await expect(contracts.ETSAccessControls.connect(accounts.RandomOne).toggleRelayerLock(relayerAddress)).to.be
        .reverted;

      expect(await contracts.ETSAccessControls.toggleRelayerLock(relayerAddress))
        .to.emit(relayerAddress, "RelayerLockToggled")
        .withArgs(relayerAddress);

      expect(await contracts.ETSAccessControls.isRelayerLocked(relayerAddress)).to.be.equal(true);
      expect(await contracts.ETSAccessControls.toggleRelayerLock(relayerAddress))
        .to.emit(relayerAddress, "RelayerLockToggled")
        .withArgs(relayerAddress);
    });

    it("is paused (not locked) by platform if relayer owner's CTAG balance drops to zero.", async () => {
      expect(await contracts.ETSToken.balanceOf(accounts.RandomOne.address)).to.be.equal(2);
      // Relayer should not be locked.
      expect(await contracts.ETSAccessControls.isRelayerLocked(relayerAddress)).to.be.equal(false);

      // Transfer owned tokens so balance goes to zero
      await contracts.ETSToken.connect(accounts.RandomOne).transferFrom(
        accounts.RandomOne.address,
        accounts.ETSPlatform.address,
        tokenId,
      );
      await contracts.ETSToken.connect(accounts.RandomOne).transferFrom(
        accounts.RandomOne.address,
        accounts.ETSPlatform.address,
        tokenId2,
      );

      expect(await contracts.ETSToken.balanceOf(accounts.RandomOne.address)).to.be.equal(0);
      expect(await uniswapRelayer.paused()).to.be.equal(true);
      expect(await contracts.ETSAccessControls.isRelayerLocked(relayerAddress)).to.be.equal(false);
    });

    it("cannot be unpaused by owner if locked by platform", async () => {
      // Pause as the owner
      expect(await uniswapRelayer.pause())
        .to.emit(relayerAddress, "Paused")
        .withArgs(accounts.RandomOne.address);

      // Verify that it's paused.
      expect(await uniswapRelayer.paused()).to.be.equal(true);

      // Now lock it at the platform level.
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleRelayerLock(relayerAddress);
      expect(await contracts.ETSAccessControls.isRelayerLocked(relayerAddress)).to.be.equal(true);
      await expect(uniswapRelayer.unpause()).to.be.revertedWith("Unpausing not permitted");
    });

    it("must be paused before transferring to new owner", async () => {
      // Verify that relayer is not paused.
      expect(await uniswapRelayer.paused()).to.be.equal(false);
      await expect(uniswapRelayer.changeOwner(accounts.RandomTwo.address)).to.be.revertedWith("Pausable: not paused");
      await uniswapRelayer.pause();
      // Attempt to transfer ownership.
      expect(await uniswapRelayer.changeOwner(accounts.RandomTwo.address))
        .to.emit(relayerAddress, "RelayerOwnerChanged")
        .withArgs(relayerAddress);
    });

    it("can only be transferred by current owner", async () => {
      // Verify that relayer is not paused.
      await uniswapRelayer.pause();
      await expect(
        uniswapRelayer.connect(accounts.ETSPlatform).changeOwner(accounts.RandomTwo.address),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("when transferred should no longer belong to previous owner", async () => {
      // Verify that relayer is not paused.
      await uniswapRelayer.pause();
      await uniswapRelayer.changeOwner(accounts.RandomTwo.address);
      expect(await contracts.ETSAccessControls.isRelayerByOwner(accounts.RandomOne.address)).to.be.equal(false);
      expect(await contracts.ETSAccessControls.isRelayerByOwner(accounts.RandomTwo.address)).to.be.equal(true);
    });

  });
});
