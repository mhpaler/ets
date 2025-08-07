import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import type { Accounts, Contracts } from "./setup";
import { getFactories, setup } from "./setup";

describe("ETS Target tests", () => {
  let accounts: Accounts;
  let contracts: Contracts;
  let targetURI: string;
  let tx: any;

  beforeEach("Setup test", async () => {
    const result = await setup();
    ({ accounts, contracts } = result);
    targetURI = "https://google.com";
  });

  describe("Valid setup", async () => {
    it("should have Access controls set to ETSAccessControls contract", async () => {
      expect(await contracts.ETSTarget.etsAccessControls()).to.be.equal(await contracts.ETSAccessControls.getAddress());
    });
  });

  describe("Setting access controls", async () => {
    it("should revert if set to zero address", async () => {
      await expect(
        contracts.ETSTarget.connect(accounts.ETSPlatform).setAccessControls(ethers.ZeroAddress),
      ).to.be.revertedWith("Address cannot be zero");
    });

    it("should revert if caller is not administrator", async () => {
      await expect(contracts.ETSTarget.connect(accounts.RandomTwo).setAccessControls(accounts.RandomOne.address)).to.be
        .reverted;
    });

    it("should revert if a access controls is set to a non-access control contract", async () => {
      await expect(contracts.ETSTarget.connect(accounts.ETSPlatform).setAccessControls(accounts.RandomTwo.address)).to
        .be.reverted;
    });

    it("should revert if caller is not set as admin in contract being set.", async () => {
      const factories = await getFactories();
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

    it("should emit AccessControlsSet", async () => {
      const factories = await getFactories();
      const ETSAccessControlsNew = await upgrades.deployProxy(
        factories.ETSAccessControls,
        [accounts.ETSPlatform.address],
        { kind: "uups" },
      );

      await expect(
        contracts.ETSTarget.connect(accounts.ETSPlatform).setAccessControls(await ETSAccessControlsNew.getAddress()),
      )
        .to.emit(contracts.ETSTarget, "AccessControlsSet")
        .withArgs(await ETSAccessControlsNew.getAddress());
      expect(await contracts.ETSTarget.etsAccessControls()).to.be.equal(await ETSAccessControlsNew.getAddress());
    });
  });

  describe("Creating a new target Id via getOrCreateTargetId", async () => {
    it("should emit the new target Id", async () => {
      const targetId = await contracts.ETSTarget.computeTargetId(targetURI);
      tx = await contracts.ETSTarget.getOrCreateTargetId(targetURI);
      await expect(tx).to.emit(contracts.ETSTarget, "TargetCreated").withArgs(targetId);
    });
  });

  describe("Getting an existing target Id via getOrCreateTargetId ", async () => {
    it("should not emit the TargetCreated event", async () => {
      const _targetId = await contracts.ETSTarget.computeTargetId(targetURI);
      await contracts.ETSTarget.getOrCreateTargetId(targetURI);

      tx = await contracts.ETSTarget.getOrCreateTargetId(targetURI);
      await expect(tx).not.to.emit(contracts.ETSTarget, "TargetCreated");
    });
  });

  describe("Getting a target object", async () => {
    it("should work with either target URI or target Id", async () => {
      await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);
      // Fetch target object using target URI string.
      const targetObjViaURI = await contracts.ETSTarget.getTargetByURI(targetURI);
      expect(targetObjViaURI.targetURI).to.be.equal(targetURI);
      expect(targetObjViaURI.createdBy).to.be.equal(accounts.RandomOne.address);

      // Fetch target object using target Id.
      const targetId = await contracts.ETSTarget.computeTargetId(targetURI);
      const targetObjViaId = await contracts.ETSTarget.getTargetById(targetId);
      expect(targetObjViaId.targetURI).to.be.equal(targetURI);
      expect(targetObjViaId.createdBy).to.be.equal(accounts.RandomOne.address);
    });
  });

  describe("Updating a target object", async () => {
    it("should revert when attempted directly", async () => {
      await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);
      const targetId = await contracts.ETSTarget.computeTargetId(targetURI);
      const blockNum = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNum);

      if (!block) {
        throw new Error(`Block ${blockNum} not found`);
      }

      const timestamp = block.timestamp;
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

    /*     it("should succeed via ETSEnrichTarget", async () => {
      await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);
      const targetId = await contracts.ETSTarget.computeTargetId(targetURI);

      await expect(
        contracts.ETSEnrichTarget.connect(accounts.ETSPlatform).fulfillEnrichTarget(
          targetId,
          "https://bafybeiaomvioo67qmjk3zhuv4oqyp5ylzppvhqzqypqdslei6elsi2nr3m.ipfs.infura-ipfs.io/",
          404,
        ),
      ).to.not.be.revertedWith("Access denied");
    }); */
  });
});
