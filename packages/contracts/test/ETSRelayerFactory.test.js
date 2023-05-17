const { setup } = require("./setup.js");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ETSRelayerFactory Tests", function () {
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();
  });

  describe("Valid setup/initialization", async function () {
    it("sets RELAYER_ADMIN as the role that can administer RELAYER role.", async () => {
      expect(await contracts.ETSAccessControls.getRoleAdmin(ethers.utils.id("RELAYER"))).to.be.equal(
        await ethers.utils.id("RELAYER_ADMIN"),
      );
    });

    it("grants ETSRelayerFactory the RELAYER_ADMIN role", async function () {
      expect(await contracts.ETSAccessControls.isRelayerAdmin(contracts.ETSRelayerFactory.address)).to.be.equal(
        true,
      );
    });
  });

  describe("New relayers", async function () {
    it("can only be added by factory with RELAYER_ROLE_ADMIN role.", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).revokeRole(
        ethers.utils.id("RELAYER_ADMIN"),
        contracts.ETSRelayerFactory.address,
      );

      await expect(contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap")).to.be.reverted;

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).grantRole(
        ethers.utils.id("RELAYER_ADMIN"),
        contracts.ETSRelayerFactory.address,
      );

      const tx = await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap");
      await expect(tx).to.emit(contracts.ETSAccessControls, "RelayerAdded");
    });

    it("Revert if name is too short", async () => {
      await expect(contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("X")).to.be.revertedWith(
        "Relayer name too short",
      );
    });

    it("Revert if name is too long", async () => {
      await expect(
        contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer(
          "this is a relayer name that is well well well well over the limit in length",
        ),
      ).to.be.revertedWith("Relayer name too long");
    });

    it("Revert if name already exists", async () => {
      await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap");

      await expect(
        contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap"),
      ).to.be.revertedWith("Relayer name exists");
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

    it("can be paused/unpaused by Administrator", async () => {
      await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap");

      // Try pausing by non-administrator account.
      const relayerAddress = await contracts.ETSAccessControls.getRelayerAddressFromName("Uniswap");
      await expect(contracts.ETSAccessControls.connect(accounts.RandomOne).toggleIsRelayerPaused(relayerAddress)).to
        .be.reverted;

      await expect(contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsRelayerPaused(relayerAddress))
        .to.emit(contracts.ETSAccessControls, "RelayerPauseToggled")
        .withArgs(relayerAddress);

      expect(await contracts.ETSAccessControls.isRelayerAndNotPaused(relayerAddress)).to.be.equal(false);

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsRelayerPaused(relayerAddress);
      expect(await contracts.ETSAccessControls.isRelayerAndNotPaused(relayerAddress)).to.be.equal(true);
    });
  });

  describe("Active relayer contracts", async () => {
    beforeEach("Setup test", async () => {
      await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Uniswap");
      relayerAddress = await contracts.ETSAccessControls.getRelayerAddressFromName("Uniswap");
      etsRelayerV1ABI = require("../abi/contracts/relayers/ETSRelayerV1.sol/ETSRelayerV1.json");
      // Connect with owner account
      uniswapRelayer = new ethers.Contract(relayerAddress, etsRelayerV1ABI, accounts.RandomOne);
    });

    it("can be verified by address", async () => {
      expect(await contracts.ETSAccessControls.isRelayerByAddress(relayerAddress)).to.be.equal(true);
      expect(await contracts.ETSAccessControls.isRelayer(relayerAddress)).to.be.equal(true);
    });

    it("can be verified by name", async () => {
      expect(await contracts.ETSAccessControls.isRelayerByName("Uniswap")).to.be.equal(true);
    });

    it("can be paused & unpaused by Owner", async () => {
      expect(await uniswapRelayer.paused()).to.be.equal(false);
      expect(await uniswapRelayer.isPausedByOwner()).to.be.equal(false);

      // Now pause as the owner
      expect(await uniswapRelayer.pause())
        .to.emit(relayerAddress, "Paused")
        .withArgs(accounts.RandomOne.address);

      expect(await uniswapRelayer.unpause())
        .to.emit(relayerAddress, "Unpaused")
        .withArgs(accounts.RandomOne.address);
    });

    it("will revert if non-owner attempts to pause", async () => {
      // Try pausing as non-owner (eg. RandomTwo)
      uniswapRelayer2 = new ethers.Contract(relayerAddress, etsRelayerV1ABI, accounts.RandomTwo);
      await expect(uniswapRelayer2.pause()).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
