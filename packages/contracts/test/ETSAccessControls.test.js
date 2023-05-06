const { setup } = require("./setup.js");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("ETSAccessControls Tests", function () {
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();

    // ETSRelayer is deployed globally for all tests,
    // so let's deploy a mock for testing access controls.
    RelayerMock = await ethers.getContractFactory("RelayerMock", accounts.RandomOne);
    relayerMock = await RelayerMock.deploy(
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

    it("sets RELAYER_ADMIN as the role that can administer RELAYER role.", async () => {
      expect(await contracts.ETSAccessControls.getRoleAdmin(ethers.utils.id("RELAYER"))).to.be.equal(
        await ethers.utils.id("RELAYER_ADMIN"),
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

  describe("New relayers", async function () {
    it("can only be added by RELAYER_ROLE_ADMIN role.", async () => {
      // accounts.RandomOne tries to add Relayer.
      await expect(
        contracts.ETSAccessControls.connect(accounts.RandomOne).addRelayer(
          relayerMock.address,
          await relayerMock.getRelayerName(),
        ),
      ).to.be.reverted;

      const tx = await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addRelayer(
        relayerMock.address,
        await relayerMock.getRelayerName(),
      );
      await expect(tx).to.emit(contracts.ETSAccessControls, "RelayerAdded").withArgs(relayerMock.address, false);
    });

    it("can be a wallet address if that address has ETSAdministrator role", async () => {
      // Having a wallet as a relayer is ONLY for making testing core functions easier.
      await expect(
        contracts.ETSAccessControls.connect(accounts.RandomOne).addRelayer(accounts.RandomOne.address, "RandomOne"),
      ).to.be.reverted;

      // RandomOne wallet MUST have RELAYER_ROLE_ADMIN in order to be added as relayer.
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).grantRole(
        await contracts.ETSAccessControls.RELAYER_ROLE_ADMIN(),
        accounts.RandomOne.address,
      );

      // RandomOne adds itself as a relayer.
      const tx = await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addRelayer(
        accounts.RandomOne.address,
        "RandomOne",
      );
      await expect(tx)
        .to.emit(contracts.ETSAccessControls, "RelayerAdded")
        .withArgs(accounts.RandomOne.address, true);
    });

    it("are not paused when added", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addRelayer(
        relayerMock.address,
        await relayerMock.getRelayerName(),
      );

      expect(await contracts.ETSAccessControls.isRelayerAndNotPaused(relayerMock.address)).to.be.equal(true);
    });

    it("must implement IETSRelayer interface.", async () => {
      // Trying to add wallet address as relayer.
      await expect(
        contracts.ETSAccessControls.connect(accounts.ETSPlatform).addRelayer(accounts.RandomOne.address, "Random"),
      ).to.be.reverted;
    });

    it("must have unique address.", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addRelayer(
        relayerMock.address,
        await relayerMock.getRelayerName(),
      );

      await expect(
        contracts.ETSAccessControls.connect(accounts.ETSPlatform).addRelayer(
          relayerMock.address,
          "Duplicate address",
        ),
      ).to.be.revertedWith("Relayer exists");
    });

    it("can be paused/unpaused by Administrator", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addRelayer(
        relayerMock.address,
        await relayerMock.getRelayerName(),
      );
      // Try unpausing by non-administrator account.
      await expect(
        contracts.ETSAccessControls.connect(accounts.RandomOne).toggleIsRelayerPaused(relayerMock.address),
      ).to.be.reverted;

      await expect(
        contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsRelayerPaused(relayerMock.address),
      )
        .to.emit(contracts.ETSAccessControls, "RelayerPauseToggled")
        .withArgs(relayerMock.address);

      expect(await contracts.ETSAccessControls.isRelayerAndNotPaused(relayerMock.address)).to.be.equal(false);

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsRelayerPaused(relayerMock.address);
      expect(await contracts.ETSAccessControls.isRelayerAndNotPaused(relayerMock.address)).to.be.equal(true);
    });
  });

  describe("Active relayer contracts", async () => {
    beforeEach("Setup test", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addRelayer(
        relayerMock.address,
        "RelayerMock",
      );
    });
    it("can be verified by address", async () => {
      expect(await contracts.ETSAccessControls.isRelayerByAddress(relayerMock.address)).to.be.equal(true);
      expect(await contracts.ETSAccessControls.isRelayer(relayerMock.address)).to.be.equal(true);
    });
    it("can be verified by name", async () => {
      expect(await contracts.ETSAccessControls.isRelayerByName("RelayerMock")).to.be.equal(true);
    });
    it("can be paused & unpaused by Owner", async () => {
      expect(await relayerMock.paused()).to.be.equal(false);
      expect(await relayerMock.isPausedByOwner()).to.be.equal(false);

      // Try pausing as non-owner (eg. ETSPlatform)
      await expect(relayerMock.connect(accounts.ETSPlatform).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );

      // Now pause as the owner
      await expect(relayerMock.connect(accounts.RandomTwo).pause())
        .to.emit(relayerMock, "Paused")
        .withArgs(accounts.RandomTwo.address);

      await expect(relayerMock.connect(accounts.RandomTwo).unpause())
        .to.emit(relayerMock, "Unpaused")
        .withArgs(accounts.RandomTwo.address);
    });
  });
});
