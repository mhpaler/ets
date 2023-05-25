const { setup, getFactories, getArtifacts } = require("./setup.js");

let artifacts, factories;

describe("Upgrades tests", function () {
  beforeEach("Setup test", async function () {
    factories = await getFactories();
    [accounts, contracts, initSettings] = await setup();

    // Transfer one of RandomOne's tokens to RandomTwo so RandomTwo can add a relayer.
    const tag2 = "#HATE";
    tokenId2 = await contracts.ETSToken.computeTagId(tag2);
    await contracts.ETSToken.connect(accounts.RandomOne).transferFrom(
      accounts.RandomOne.address,
      accounts.RandomTwo.address,
      tokenId2,
    );

    await contracts.ETSRelayerFactory.connect(accounts.RandomOne).addRelayer("Relayer 1");
    await contracts.ETSRelayerFactory.connect(accounts.RandomTwo).addRelayer("Relayer 2");

    beaconAddress = await contracts.ETSRelayerFactory.getBeacon();
    relayer1Address = await contracts.ETSAccessControls.getRelayerAddressFromName("Relayer 1");
    relayer2Address = await contracts.ETSAccessControls.getRelayerAddressFromName("Relayer 2");

    etsRelayerBeaconABI = require("../abi/contracts/relayers/ETSRelayerBeacon.sol/ETSRelayerBeacon.json");
    etsRelayerV1ABI = require("../abi/contracts/relayers/ETSRelayerV1.sol/ETSRelayerV1.json");
    etsRelayerV2testABI = require("../abi/contracts/test/ETSRelayerV2test.sol/ETSRelayerV2test.json");
  });

  describe("ETSRelayer", function () {
    it("is upgradeable", async function () {

      relayer1v1 = new ethers.Contract(relayer1Address, etsRelayerV1ABI, accounts.Buyer);
      relayer2v1 = new ethers.Contract(relayer2Address, etsRelayerV1ABI, accounts.Creator);

      expect(await relayer1v1.version()).to.be.equal("0.1-Beta");
      expect(await relayer2v1.version()).to.be.equal("0.1-Beta");

      // Connect to the beacon contract by platform
      etsRelayerBeacon = new ethers.Contract(beaconAddress, etsRelayerBeaconABI, accounts.ETSAdmin);

      // Deploy v2 relayer, and update beacon with address.
      const ETSRelayerV2test = await factories.ETSRelayerV2test.deploy();
      await etsRelayerBeacon.update(ETSRelayerV2test.address);
      expect(await etsRelayerBeacon.implementation()).to.be.equal(ETSRelayerV2test.address);

      // Reload relayers, note addresses (of proxies) haven't changed, only the API has.
      relayer1v2 = new ethers.Contract(relayer1Address, etsRelayerV2testABI, accounts.Buyer);
      relayer2v2 = new ethers.Contract(relayer2Address, etsRelayerV2testABI, accounts.Creator);

      // Expect version bump.
      expect(await relayer1v2.version()).to.be.equal("0.2-Beta");
      expect(await relayer2v1.version()).to.be.equal("0.2-Beta");

      // Expect new function present.
      expect(await relayer1v2.newFunction()).to.be.equal(true);
      expect(await relayer2v2.newFunction()).to.be.equal(true);
    });

    it("is only upgradeable by owner", async function () {

      // Connect to the beacon contract using random address.
      etsRelayerBeacon = new ethers.Contract(beaconAddress, etsRelayerBeaconABI, accounts.RandomTwo);

      // Deploy v2 relayer, and try to update beacon with address.
      const ETSRelayerV2test = await factories.ETSRelayerV2test.deploy();
      await expect(etsRelayerBeacon.update(ETSRelayerV2test.address)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });
});
