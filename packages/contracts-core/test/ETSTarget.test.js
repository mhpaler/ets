const {setup} = require("./setup.js");
const {ethers} = require("hardhat");
const {expect, assert} = require("chai");
const {constants} = ethers;

//let accounts, factories, contracts.ETSAccessControls, ETSLifeCycleControls, contracts.ETSToken;
let targetURI;

describe("ETS Target tests", function () {
  // we create a setup function that can be called by every test and setup variable for easy to read tests
  beforeEach("Setup test", async function () {
    [accounts, contracts, initSettings] = await setup();
    targetURI = "https://google.com";
  });

  describe("Valid setup", async function () {
    it("should have Access controls set to ETSAccessControls contract", async function () {
      const enrich = await contracts.ETSTarget.etsEnrichTarget();
      expect(await contracts.ETSTarget.etsAccessControls()).to.be.equal(contracts.ETSAccessControls.address);
    });
  });

  describe("Administrator role", async function () {
    it("should be able to set access controls", async function () {
      await expect(contracts.ETSTarget.connect(accounts.RandomTwo).setAccessControls(accounts.RandomOne.address)).to.be
        .reverted;
      await contracts.ETSTarget.connect(accounts.ETSPlatform).setAccessControls(accounts.RandomTwo.address);
      expect(await contracts.ETSTarget.etsAccessControls()).to.be.equal(accounts.RandomTwo.address);
    });
  });

  describe("Setting access controls", async () => {
    it("should revert when setting to zero address", async function () {
      await expect(
        contracts.ETSTarget.connect(accounts.ETSPlatform).setAccessControls(constants.AddressZero),
      ).to.be.revertedWith("Access controls cannot be zero");
    });
  });

  describe("Creating a new target Id via getOrCreateTargetId", async function () {
    it("should emit the new target Id", async () => {
      //const target = "https://google.com";
      const targetId = await contracts.ETSTarget.computeTargetId(targetURI);
      tx = await contracts.ETSTarget.getOrCreateTargetId(targetURI);
      await expect(tx).to.emit(contracts.ETSTarget, "TargetCreated").withArgs(targetId);
    });
  });

  describe("Getting an existing target Id via getOrCreateTargetId ", async function () {
    it("should not emit the TargetCreated event", async () => {
      const targetId = await contracts.ETSTarget.computeTargetId(targetURI);
      await contracts.ETSTarget.getOrCreateTargetId(targetURI);

      tx = await contracts.ETSTarget.getOrCreateTargetId(targetURI);
      await expect(tx).to.not.emit(contracts.ETSTarget, "TargetCreated").withArgs(targetId);
    });
  });

  describe("Getting a target object", async function () {
    it("should work with either target URI or target Id", async () => {
      await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);
      // Fetch target object using target URI string.
      const targetObjViaURI = await contracts.ETSTarget["getTarget(string)"](targetURI);
      expect(targetObjViaURI.targetURI.toString()).to.be.equal(targetURI);
      expect(targetObjViaURI.createdBy).to.be.equal(accounts.RandomOne.address);

      // Fetch target object using target Id.
      const targetId = await contracts.ETSTarget.computeTargetId(targetURI);
      const targetObjViaId = await contracts.ETSTarget["getTarget(uint256)"](targetId);
      expect(targetObjViaId.targetURI.toString()).to.be.equal(targetURI);
      expect(targetObjViaId.createdBy).to.be.equal(accounts.RandomOne.address);
    });
  });

  describe("Updating a target object", async () => {
    it("should revert when attempted directly", async () => {
      await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);
      const targetId = await contracts.ETSTarget.computeTargetId(targetURI);
      let blockNum = await ethers.provider.getBlockNumber();
      let block = await ethers.provider.getBlock(blockNum);
      let timestamp = block.timestamp;
      await expect(
        contracts.ETSTarget.connect(accounts.RandomOne).updateTarget(
          targetId,
          targetURI,
          timestamp,
          404,
          "https://bafybeiaomvioo67qmjk3zhuv4oqyp5ylzppvhqzqypqdslei6elsi2nr3m.ipfs.infura-ipfs.io/",
        ),
      ).to.be.revertedWith("Only ETSEnrichTarget may update target");
    });

    it("should succeed via ETSEnrichTarget", async () => {
      await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);
      const targetId = await contracts.ETSTarget.computeTargetId(targetURI);

      await expect(
        contracts.ETSEnrichTarget.connect(accounts.ETSPlatform).fulfillEnrichTarget(
          targetId,
          "https://bafybeiaomvioo67qmjk3zhuv4oqyp5ylzppvhqzqypqdslei6elsi2nr3m.ipfs.infura-ipfs.io/",
          404,
        ),
      ).to.not.be.revertedWith("Only ETSEnrichTarget may update target");
    });
  });
});
