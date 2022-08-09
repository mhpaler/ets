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

    it("grants ETSPlatform the PUBLISHER role", async function () {
      expect(await contracts.ETSAccessControls.isPublisher(accounts.ETSPlatform.address)).to.be.equal(true);
    });

    it("sets PUBLISHER_ADMIN as the role that can administer PUBLISHER role.", async () => {
      expect(await contracts.ETSAccessControls.getRoleAdmin(ethers.utils.id("PUBLISHER"))).to.be.equal(
        await ethers.utils.id("PUBLISHER_ADMIN"),
      );
    });
  });

  describe("Only administrator", async function () {
    it("can set Platform address", async function () {
      await expect(contracts.ETSAccessControls.connect(accounts.Buyer).setPlatform(accounts.RandomOne.address)).to.be
        .reverted;

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).setPlatform(accounts.RandomOne.address);
      expect(await contracts.ETSAccessControls.getPlatformAddress()).to.be.equal(accounts.RandomOne.address);
    });

    it("can add a Target Tagger", async function () {
      await expect(
        contracts.ETSAccessControls.connect(accounts.Buyer).addTargetTagger(
          contracts.ETSTargetTagger.address,
          await contracts.ETSTargetTagger.getTaggerName(),
        ),
      ).to.be.reverted;

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addTargetTagger(
        contracts.ETSTargetTagger.address,
        await contracts.ETSTargetTagger.getTaggerName(),
      );

      expect(await contracts.ETSAccessControls.isTargetTaggerByAddress(contracts.ETSTargetTagger.address)).to.be.equal(
        true,
      );
    });

    it("can pause/unpause a Target Tagger via ETSAccessControls", async function () {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addTargetTagger(
        contracts.ETSTargetTagger.address,
        await contracts.ETSTargetTagger.getTaggerName(),
      );

      expect(
        await contracts.ETSAccessControls.isTargetTaggerAndNotPaused(contracts.ETSTargetTagger.address),
      ).to.be.equal(true);

      await expect(
        contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsTargetTaggerPaused(
          contracts.ETSTargetTagger.address,
        ),
      )
        .to.emit(contracts.ETSAccessControls, "TargetTaggerPauseToggled")
        .withArgs(contracts.ETSTargetTagger.address);

      expect(
        await contracts.ETSAccessControls.isTargetTaggerAndNotPaused(contracts.ETSTargetTagger.address),
      ).to.be.equal(false);

      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsTargetTaggerPaused(
        contracts.ETSTargetTagger.address,
      );

      expect(
        await contracts.ETSAccessControls.isTargetTaggerAndNotPaused(contracts.ETSTargetTagger.address),
      ).to.be.equal(true);
    });
  });

  describe("Third party Target Taggers", async () => {
    beforeEach("Setup test", async () => {
      TargetTaggerMock = await ethers.getContractFactory("TargetTaggerMock", accounts.RandomOne);
      targetTaggerMock = await TargetTaggerMock.deploy(
        contracts.ETS.address,
        contracts.ETSToken.address,
        contracts.ETSTarget.address,
        accounts.RandomOne.address, // creator
        accounts.RandomTwo.address, // transfer to (new owner)
      );

      const tx = await contracts.ETSAccessControls.connect(accounts.ETSPlatform).addTargetTagger(
        targetTaggerMock.address,
        "TargetTaggerMock",
      );

      // Would be nice to test RoleGranted emission, but another time
      // We check that it's set below.
      // const receipt = await tx.wait();
      //
      // for (const event of receipt.events) {
      //   console.log(`Event ${event.event} with args ${event.args}`);
      //   if (event.event == "RoleGranted") {
      //
      //   }
      // }
      await expect(tx).to.emit(contracts.ETSAccessControls, "TargetTaggerAdded").withArgs(targetTaggerMock.address);
      expect(await contracts.ETSAccessControls.isTargetTaggerByAddress(targetTaggerMock.address)).to.be.equal(true);
      expect(await contracts.ETSAccessControls.isPublisher(targetTaggerMock.address)).to.be.equal(true);
    });
    it("Can be verified by address", async () => {
      expect(await contracts.ETSAccessControls.isTargetTaggerByAddress(targetTaggerMock.address)).to.be.equal(true);
    });
    it("Can be verified by name", async () => {
      expect(await contracts.ETSAccessControls.isTargetTaggerByName("TargetTaggerMock")).to.be.equal(true);
    });
    it("Can be paused & unpaused by ETS", async () => {
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsTargetTaggerPaused(
        await contracts.ETSAccessControls.targetTaggerNameToContract("TargetTaggerMock"),
      );

      expect(
        await contracts.ETSAccessControls.isTargetTaggerAndNotPaused(
          await contracts.ETSAccessControls.targetTaggerNameToContract("TargetTaggerMock"),
        ),
      ).to.be.equal(false);
      await contracts.ETSAccessControls.connect(accounts.ETSPlatform).toggleIsTargetTaggerPaused(
        await contracts.ETSAccessControls.targetTaggerNameToContract("TargetTaggerMock"),
      );

      expect(
        await contracts.ETSAccessControls.isTargetTaggerAndNotPaused(
          await contracts.ETSAccessControls.targetTaggerNameToContract("TargetTaggerMock"),
        ),
      ).to.be.equal(true);
    });
    it("Can be removed by ETS", async () => {
      const tx = await contracts.ETSAccessControls.connect(accounts.ETSPlatform).removeTargetTagger(
        targetTaggerMock.address,
      );
      await expect(tx).to.emit(contracts.ETSAccessControls, "TargetTaggerRemoved").withArgs(targetTaggerMock.address);
      expect(await contracts.ETSAccessControls.isTargetTaggerByAddress(targetTaggerMock.address)).to.be.equal(false);
      expect(await contracts.ETSAccessControls.isTargetTaggerByName("TargetTaggerMock")).to.be.equal(false);
      expect(await contracts.ETSAccessControls.isPublisher(targetTaggerMock.address)).to.be.equal(false);
    });
  });
});
