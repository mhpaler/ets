const { expectEvent } = require("@openzeppelin/test-helpers");
const { ethers, upgrades, artifacts } = require("hardhat");
const { assert } = require("chai");

let factories, artifact, deployed, accounts;

before("get factories", async function () {
  artifact = {
    ETSAccessControlsUpgrade: await artifacts.readArtifactSync("ETSAccessControlsUpgrade"),
    ETSUpgrade: await artifacts.readArtifactSync("ETSUpgrade"),
  };

  factories = {
    ETSAccessControls: await ethers.getContractFactory("ETSAccessControls"),
    ETSAccessControlsUpgrade: await ethers.getContractFactory("ETSAccessControlsUpgrade"),
    ETSToken: await ethers.getContractFactory("ETSToken"),
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
    ETSToken: {},
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

describe("ETSToken", function () {
  it("is upgradeable", async function () {
    // Deploy the initial proxy contract.
    deployed.ETSToken = await upgrades.deployProxy(
      factories.ETSToken,
      [deployed.ETSAccessControls.address, accounts.ETSPlatform.address],
      { kind: "uups" },
    );

    assert((await deployed.ETSToken.name()) === "Ethereum Tag Service");
    assert((await deployed.ETSToken.symbol()) === "CTAG");

    // Upgrade the proxy.
    deployed.ETSToken = await upgrades.upgradeProxy(
      deployed.ETSToken.address,
      factories.ETSUpgrade,
    );

    const deployTxn = deployed.ETSToken.deployTransaction.hash;
    await expectEvent.inTransaction(deployTxn, artifact.ETSUpgrade, "Upgraded");
    assert((await deployed.ETSToken.name()) === "Ethereum Tag Service");
    assert((await deployed.ETSToken.symbol()) === "CTAG");
    // Upgraded contract has new function upgradeTest()
    assert((await deployed.ETSToken.upgradeTest()) === true);
  });
});
