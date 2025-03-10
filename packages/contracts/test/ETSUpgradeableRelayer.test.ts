import { expect } from "chai";
import type { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { getFactories, setup } from "./setup";
import type { Accounts, Contracts, Factories } from "./setup";

// Define interfaces for the relayer contracts
interface ETSRelayerUpgraded {
  version(): Promise<string>;
  newFunction(): Promise<boolean>;
}

describe("Upgrades tests", () => {
  let accounts: Accounts;
  let contracts: Contracts;
  let factories: Factories;
  let ETSRelayerUpgradeTestFactory: ContractFactory;
  let tokenId: bigint;
  let tokenId2: bigint;
  let beaconAddress: string;
  let relayer1Address: string;
  let relayer2Address: string;
  let etsRelayerBeaconABI: any;
  let etsRelayerABI: any;
  let etsRelayerUpgradeTestABI: any;
  let etsRelayerBeacon: Contract;
  let relayer1v1: Contract;
  let relayer1v2: Contract;
  let relayer2v1: Contract;
  let relayer2v2: Contract;

  beforeEach("Setup test", async () => {
    factories = await getFactories();
    const result = await setup();
    ({ accounts, contracts } = result);
    ETSRelayerUpgradeTestFactory = await ethers.getContractFactory("ETSRelayerUpgradeTest");

    // Create two tags and transfer them to RandomOne so that user can add a relayer in tests.
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
      accounts.RandomTwo.address,
      tokenId2,
    );

    await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Relayer 1");
    await contracts.ETSRelayerFactory.connect(accounts.RandomTwo).addRelayer("Relayer 2");

    beaconAddress = await contracts.ETSRelayerFactory.getBeacon();
    relayer1Address = await contracts.ETSAccessControls.getRelayerAddressFromName("Relayer 1");
    relayer2Address = await contracts.ETSAccessControls.getRelayerAddressFromName("Relayer 2");

    etsRelayerBeaconABI = require("../abi/contracts/relayers/ETSRelayerBeacon.sol/ETSRelayerBeacon.json");
    etsRelayerABI = require("../abi/contracts/relayers/ETSRelayer.sol/ETSRelayer.json");
    etsRelayerUpgradeTestABI = require("../abi/contracts/test/ETSRelayerUpgradeTest.sol/ETSRelayerUpgradeTest.json");
  });

  describe("ETSRelayer", () => {
    it("is upgradeable", async () => {
      relayer1v1 = new ethers.Contract(relayer1Address, etsRelayerABI, accounts.Buyer);
      relayer2v1 = new ethers.Contract(relayer2Address, etsRelayerABI, accounts.Creator);

      expect(await relayer1v1.version()).to.be.equal("0.1.1");
      expect(await relayer2v1.version()).to.be.equal("0.1.1");

      // Connect to the beacon contract by platform
      etsRelayerBeacon = new ethers.Contract(beaconAddress, etsRelayerBeaconABI, accounts.ETSAdmin);

      // Deploy v2 relayer, and update beacon with address.
      const ETSRelayerUpgradeTest = await ETSRelayerUpgradeTestFactory.deploy();
      await etsRelayerBeacon.update(await ETSRelayerUpgradeTest.getAddress());
      expect(await etsRelayerBeacon.implementation()).to.be.equal(await ETSRelayerUpgradeTest.getAddress());

      // Reload relayers, note addresses (of proxies) haven't changed, only the API has.
      relayer1v2 = new ethers.Contract(relayer1Address, etsRelayerUpgradeTestABI, accounts.Buyer);
      relayer2v2 = new ethers.Contract(relayer2Address, etsRelayerUpgradeTestABI, accounts.Creator);

      // Expect version bump.
      expect(await relayer1v2.version()).to.be.equal("UPGRADE TEST");
      expect(await relayer2v1.version()).to.be.equal("UPGRADE TEST");

      // Expect new function present.
      expect(await (relayer1v2 as unknown as ETSRelayerUpgraded).newFunction()).to.be.equal(true);
      expect(await (relayer2v2 as unknown as ETSRelayerUpgraded).newFunction()).to.be.equal(true);
    });

    it("is only upgradeable by owner", async () => {
      // Connect to the beacon contract using random address.
      etsRelayerBeacon = new ethers.Contract(beaconAddress, etsRelayerBeaconABI, accounts.RandomTwo);

      // Deploy v2 relayer, and try to update beacon with address.
      const ETSRelayerUpgradeTest = await factories.ETSRelayerUpgradeTest.deploy();
      await expect(etsRelayerBeacon.update(await ETSRelayerUpgradeTest.getAddress())).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });
});
