import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { getFactories, setup } from "./setup";
import type { Accounts, Contracts } from "./setup";

describe("ETS Enrich Target tests", () => {
  let accounts: Accounts;
  let contracts: Contracts;
  let targetURI: string;
  let targetId: bigint;
  let mockAirnodeRrp: any;
  let mockRequestId: string;

  beforeEach("Setup test", async () => {
    const result = await setup();
    ({ accounts, contracts } = result);
    targetURI = "https://example.com";

    // Create a target to use in tests
    targetId = await contracts.ETSTarget.computeTargetId(targetURI);
    await contracts.ETSTarget.connect(accounts.RandomOne).getOrCreateTargetId(targetURI);

    // Generate a fixed requestId for testing
    mockRequestId = ethers.hexlify(ethers.randomBytes(32));

    // Deploy our MockAirnodeRrp with the fixed requestId
    const MockAirnodeRrp = await ethers.getContractFactory("MockAirnodeRrp");
    mockAirnodeRrp = await MockAirnodeRrp.deploy(mockRequestId);

    // Set the mock in our ETSEnrichTarget contract using the new setAirnodeRrp function
    await contracts.ETSEnrichTarget.connect(accounts.ETSPlatform).setAirnodeRrp(await mockAirnodeRrp.getAddress());

    // Allow ETSEnrichTarget to update targets
    await contracts.ETSTarget.connect(accounts.ETSPlatform).setEnrichTarget(
      await contracts.ETSEnrichTarget.getAddress(),
    );
  });

  describe("Valid setup", async () => {
    it("should have Access controls set to ETSAccessControls contract", async () => {
      expect(await contracts.ETSEnrichTarget.etsAccessControls()).to.be.equal(
        await contracts.ETSAccessControls.getAddress(),
      );
    });

    it("should have ETSTarget set correctly", async () => {
      expect(await contracts.ETSEnrichTarget.etsTarget()).to.be.equal(await contracts.ETSTarget.getAddress());
    });

    it("should have AirnodeRrp set correctly", async () => {
      // Now this should point to our mock
      expect(await contracts.ETSEnrichTarget.airnodeRrp()).to.be.equal(await mockAirnodeRrp.getAddress());
    });
  });

  describe("Setting Airnode request parameters", async () => {
    it("should revert if caller is not administrator", async () => {
      await expect(
        contracts.ETSEnrichTarget.connect(accounts.RandomTwo).setAirnodeRequestParameters(
          accounts.RandomOne.address,
          ethers.hexlify(ethers.randomBytes(32)),
          accounts.RandomOne.address,
          accounts.RandomOne.address,
        ),
      ).to.be.reverted;
    });

    it("should succeed when called by administrator", async () => {
      const airnode = accounts.RandomOne.address;
      const endpointId = ethers.hexlify(ethers.randomBytes(32));
      const sponsorAddress = accounts.RandomOne.address;
      const sponsorWallet = accounts.RandomTwo.address;

      await contracts.ETSEnrichTarget.connect(accounts.ETSPlatform).setAirnodeRequestParameters(
        airnode,
        endpointId,
        sponsorAddress,
        sponsorWallet,
      );

      expect(await contracts.ETSEnrichTarget.airnode()).to.equal(airnode);
      expect(await contracts.ETSEnrichTarget.endpointId()).to.equal(endpointId);
      expect(await contracts.ETSEnrichTarget.sponsorAddress()).to.equal(sponsorAddress);
      expect(await contracts.ETSEnrichTarget.sponsorWallet()).to.equal(sponsorWallet);
    });
  });

  describe("Requesting target enrichment", async () => {
    beforeEach(async () => {
      // Set up Airnode parameters
      const airnode = accounts.RandomOne.address;
      const endpointId = ethers.hexlify(ethers.randomBytes(32));
      const sponsorAddress = accounts.RandomOne.address;
      const sponsorWallet = accounts.RandomTwo.address;

      await contracts.ETSEnrichTarget.connect(accounts.ETSPlatform).setAirnodeRequestParameters(
        airnode,
        endpointId,
        sponsorAddress,
        sponsorWallet,
      );
    });

    it("should revert when target doesn't exist", async () => {
      const nonExistentTargetId = 999999n;
      await expect(
        contracts.ETSEnrichTarget.connect(accounts.RandomOne).requestEnrichTarget(nonExistentTargetId),
      ).to.be.revertedWith("Invalid target");
    });

    it("should emit RequestEnrichTarget event when successful", async () => {
      await expect(contracts.ETSEnrichTarget.connect(accounts.RandomOne).requestEnrichTarget(targetId))
        .to.emit(contracts.ETSEnrichTarget, "RequestEnrichTarget")
        .withArgs(targetId);

      // Verify the request mapping was stored
      expect(await contracts.ETSEnrichTarget.requestIdToTargetId(mockRequestId)).to.equal(targetId);
    });
  });

  describe("Fulfilling target enrichment", async () => {
    beforeEach(async () => {
      // Setup Airnode parameters
      const airnode = accounts.RandomOne.address;
      const endpointId = ethers.hexlify(ethers.randomBytes(32));
      const sponsorAddress = accounts.RandomOne.address;
      const sponsorWallet = accounts.RandomTwo.address;

      await contracts.ETSEnrichTarget.connect(accounts.ETSPlatform).setAirnodeRequestParameters(
        airnode,
        endpointId,
        sponsorAddress,
        sponsorWallet,
      );

      // Make a request so we can fulfill it
      await contracts.ETSEnrichTarget.connect(accounts.RandomOne).requestEnrichTarget(targetId);
    });

    it("should revert when called by non-Airnode contract", async () => {
      const ipfsHash = "ipfs://bafybeiaomvioo67qmjk3zhuv4oqyp5ylzppvhqzqypqdslei6elsi2nr3m";
      const httpStatus = 200;
      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(["string", "uint256"], [ipfsHash, httpStatus]);

      await expect(
        contracts.ETSEnrichTarget.connect(accounts.RandomOne).fulfillEnrichTarget(mockRequestId, encodedData),
      ).to.be.revertedWith("Caller is not the AirnodeRrpV0 contract");
    });

    it("should update target and emit event when fulfilled by AirnodeRrp", async () => {
      const ipfsHash = "ipfs://bafybeiaomvioo67qmjk3zhuv4oqyp5ylzppvhqzqypqdslei6elsi2nr3m";
      const httpStatus = 200;
      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(["string", "uint256"], [ipfsHash, httpStatus]);

      // Use our mock to fulfill the request
      await expect(
        mockAirnodeRrp.fulfillRequest(
          await contracts.ETSEnrichTarget.getAddress(),
          contracts.ETSEnrichTarget.interface.getFunction("fulfillEnrichTarget").selector,
          mockRequestId,
          encodedData,
        ),
      )
        .to.emit(contracts.ETSEnrichTarget, "EnrichmentFulfilled")
        .withArgs(mockRequestId, targetId, ipfsHash, httpStatus);

      // Check that target was updated
      const target = await contracts.ETSTarget.getTargetById(targetId);
      expect(target.arweaveTxId).to.equal(ipfsHash);
      expect(target.httpStatus).to.equal(httpStatus);
      expect(target.enriched).to.not.equal(0n);
    });
  });

  describe("Integration with ETSTarget", async () => {
    it("should be able to update Target through ETSEnrichTarget", async () => {
      // Set up Airnode parameters first
      const airnode = accounts.RandomOne.address;
      const endpointId = ethers.hexlify(ethers.randomBytes(32));
      const sponsorAddress = accounts.RandomOne.address;
      const sponsorWallet = accounts.RandomTwo.address;

      await contracts.ETSEnrichTarget.connect(accounts.ETSPlatform).setAirnodeRequestParameters(
        airnode,
        endpointId,
        sponsorAddress,
        sponsorWallet,
      );

      // Verify target state before enrichment
      const targetBefore = await contracts.ETSTarget.getTargetById(targetId);
      expect(targetBefore.enriched).to.equal(0n);
      expect(targetBefore.httpStatus).to.equal(0n);
      expect(targetBefore.arweaveTxId).to.equal("");

      // Step 1: Make the enrichment request
      await contracts.ETSEnrichTarget.connect(accounts.RandomOne).requestEnrichTarget(targetId);

      // Step 2: Fulfill the request using our mock
      const ipfsHash = "ipfs://bafybeiaomvioo67qmjk3zhuv4oqyp5ylzppvhqzqypqdslei6elsi2nr3m";
      const httpStatus = 200;
      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(["string", "uint256"], [ipfsHash, httpStatus]);

      await mockAirnodeRrp.fulfillRequest(
        await contracts.ETSEnrichTarget.getAddress(),
        contracts.ETSEnrichTarget.interface.getFunction("fulfillEnrichTarget").selector,
        mockRequestId,
        encodedData,
      );

      // Step 3: Verify target was updated
      const targetAfter = await contracts.ETSTarget.getTargetById(targetId);
      expect(targetAfter.arweaveTxId).to.equal(ipfsHash);
      expect(targetAfter.httpStatus).to.equal(httpStatus);
      expect(targetAfter.enriched).to.not.equal(0n); // The timestamp will be set to block.timestamp
    });
  });
});
