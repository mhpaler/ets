const { expectEvent } = require("@openzeppelin/test-helpers");
const { ethers, upgrades, artifacts } = require("hardhat");
const { assert } = require("chai");

let factories, artifact, deployed, accounts;

before("get factories", async function () {
  artifact = {
    ETSAccessControlsUpgrade: await artifacts.readArtifactSync("ETSAccessControlsUpgrade"),
    ETSLifeCycleControlsUpgrade: await artifacts.readArtifactSync("ETSLifeCycleControlsUpgrade"),
    ETSUpgrade: await artifacts.readArtifactSync("ETSUpgrade"),
  };

  factories = {
    ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
    ETSAccessControlsUpgrade: await ethers.getContractFactory("ETSAccessControlsUpgrade"),
    ETSLifeCycleControls: await ethers.getContractFactory("ETSLifeCycleControls"),
    ETSLifeCycleControlsUpgrade: await ethers.getContractFactory("ETSLifeCycleControlsUpgrade"),
    ETS: await ethers.getContractFactory("ETS"),
    ETSUpgrade: await ethers.getContractFactory("ETSUpgrade"),
  };

  // See namedAccounts section of hardhat.config.js
  const namedAccounts = await ethers.getNamedSigners();
  accounts = {
    ETSAdmin: namedAccounts["ETSAdmin"],
    ETSPublisher: namedAccounts["ETSPublisher"],
    ETSPlatform: namedAccounts["ETSPlatform"],
  };

  // Set deployed contract placeholders so they are shareable b/w tests.
  deployed = {
    ETSAccessControls: {},
    ETSLifeCycleControls: {},
    ETS: {},
  };
});

describe("ETSAccessControl", function () {
  it("is upgradeable", async function () {
    // Deploy the initial proxy contract.
    deployed.ETSAccessControls = await upgrades.deployProxy(factories.ETSAccessControls, { kind: "uups" });
    assert((await deployed.ETSAccessControls.isAdmin(accounts.ETSAdmin.address)) === true);

    // Upgrade the proxy.
    deployed.ETSAccessControls = await upgrades.upgradeProxy(
      deployed.ETSAccessControls.address,
      factories.ETSAccessControlsUpgrade,
    );

    const deployTxn = deployed.ETSAccessControls.deployTransaction.hash;
    await expectEvent.inTransaction(deployTxn, artifact.ETSAccessControlsUpgrade, "Upgraded");
    assert((await deployed.ETSAccessControls.isAdmin(accounts.ETSAdmin.address)) === true);
    // Upgraded contract has new function upgradeTest()
    assert((await deployed.ETSAccessControls.upgradeTest()) === true);
  });
});

describe("ETSLifeCycleControls", function () {
  it("is upgradeable", async function () {
    // Deploy the initial proxy contract.
    deployed.ETSLifeCycleControls = await upgrades.deployProxy(
      factories.ETSLifeCycleControls,
      [deployed.ETSAccessControls.address],
      { kind: "uups" },
    );

    // Upgrade the proxy.
    deployed.ETSLifeCycleControls = await upgrades.upgradeProxy(
      deployed.ETSLifeCycleControls.address,
      factories.ETSLifeCycleControlsUpgrade,
    );

    const deployTxn = deployed.ETSLifeCycleControls.deployTransaction.hash;
    await expectEvent.inTransaction(deployTxn, artifact.ETSLifeCycleControlsUpgrade, "Upgraded");
    // Upgraded contract has new function upgradeTest()
    assert((await deployed.ETSLifeCycleControls.upgradeTest()) === true);
  });
});

describe("ETS", function () {
  it("is upgradeable", async function () {
    // Deploy the initial proxy contract.
    deployed.ETS = await upgrades.deployProxy(
      factories.ETS,
      [deployed.ETSAccessControls.address, deployed.ETSLifeCycleControls.address, accounts.ETSPlatform.address],
      { kind: "uups" },
    );

    assert((await deployed.ETS.name()) === "Ethereum Tag Service");
    assert((await deployed.ETS.symbol()) === "CTAG");

    // Upgrade the proxy.
    deployed.ETS = await upgrades.upgradeProxy(
      deployed.ETS.address,
      factories.ETSUpgrade,
    );

    const deployTxn = deployed.ETS.deployTransaction.hash;
    await expectEvent.inTransaction(deployTxn, artifact.ETSUpgrade, "Upgraded");
    assert((await deployed.ETS.name()) === "Ethereum Tag Service");
    assert((await deployed.ETS.symbol()) === "CTAG");
    // Upgraded contract has new function upgradeTest()
    assert((await deployed.ETS.upgradeTest()) === true);
  });
});
