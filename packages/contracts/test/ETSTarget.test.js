const { setup, getFactories } = require("./setup.js");
const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");

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
      //const enrich = await contracts.ETSTarget.etsEnrichTarget();
      expect(await contracts.ETSTarget.etsAccessControls()).to.be.equal(await contracts.ETSAccessControls.getAddress());
    });
  });

  describe("Setting access controls", async () => {
    it("should revert if set to zero address", async function () {
      await expect(
        contracts.ETSTarget.connect(accounts.ETSPlatform).setAccessControls(ethers.ZeroAddress),
      ).to.be.revertedWith("Address cannot be zero");
    });

    it("should revert if caller is not administrator", async function () {
      await expect(contracts.ETSTarget.connect(accounts.RandomTwo).setAccessControls(accounts.RandomOne.address)).to.be.reverted;
    });

    it("should revert if a access controls is set to a non-access control contract", async function () {
      await expect(contracts.ETSTarget.connect(accounts.ETSPlatform).setAccessControls(accounts.RandomTwo.address)).to.be.reverted;
    });

    it("should revert if caller is not set as admin in contract being set.", async function () {
      factories = await getFactories();
      const ETSAccessControlsNew = await upgrades.deployProxy(
        factories.ETSAccessControls,
        [accounts.ETSPlatform.address],
        { kind: "uups" },
      );

      // Random is not set as admin in access controls.
      await expect(
        contracts.ETSTarget.connect(accounts.RandomOne).setAccessControls(await ETSAccessControlsNew.getAddress()),
      ).to.be.revertedWith("Access denied");
    });

    it("should emit AccessControlsSet", async function () {
      factories = await getFactories();
      const ETSAccessControlsNew = await upgrades.deployProxy(
        factories.ETSAccessControls,
        [accounts.ETSPlatform.address],
        { kind: "uups" },
      );

      await expect(contracts.ETSTarget.connect(accounts.ETSPlatform).setAccessControls(await ETSAccessControlsNew.getAddress()))
        .to.emit(contracts.ETSTarget, "AccessControlsSet")
        .withArgs(await ETSAccessControlsNew.getAddress());
      expect(await contracts.ETSTarget.etsAccessControls()).to.be.equal(await ETSAccessControlsNew.getAddress());
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
      await expect(tx).not.to.emit(contracts.ETSTarget, "TargetCreated");
    });
  });

  describe("Getting a target object", async function () {
    it("should work with either target URI or target Id", async () => {
      await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);
      // Fetch target object using target URI string.
      const targetObjViaURI = await contracts.ETSTarget.getTargetByURI(targetURI);
      expect(targetObjViaURI.targetURI.toString()).to.be.equal(targetURI);
      expect(targetObjViaURI.createdBy).to.be.equal(accounts.RandomOne.address);

      // Fetch target object using target Id.
      const targetId = await contracts.ETSTarget.computeTargetId(targetURI);
      const targetObjViaId = await contracts.ETSTarget.getTargetById(targetId);
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
      ).to.be.revertedWith("Access denied");
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
      ).to.not.be.revertedWith("Access denied");
    });
  });
});
