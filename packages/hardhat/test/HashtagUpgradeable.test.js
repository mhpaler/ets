const { expectEvent } = require("@openzeppelin/test-helpers");
const { ethers, upgrades, artifacts } = require("hardhat");
const { assert } = require("chai");

let factories, artifact, deployed, accounts;

before("get factories", async function () {
  artifact = {
    HashtagAccessControlsUpgrade: await artifacts.readArtifactSync("HashtagAccessControlsUpgrade"),
  };

  factories = {
    HashtagAccessControls: await ethers.getContractFactory("HashtagAccessControls"),
    HashtagAccessControlsUpgrade: await ethers.getContractFactory("HashtagAccessControlsUpgrade"),
    HashtagProtocol: await ethers.getContractFactory("HashtagProtocol"),
    HashtagProtocolUpgrade: await ethers.getContractFactory("HashtagProtocolUpgrade"),
    ERC721HashtagRegistry: await ethers.getContractFactory("ERC721HashtagRegistry"),
    ERC721HashtagRegistryUpgrade: await ethers.getContractFactory("ERC721HashtagRegistryUpgrade"),
  };

  // See namedAccounts section of hardhat.config.js
  const namedAccounts = await ethers.getNamedSigners();
  accounts = {
    accountHashtagAdmin: namedAccounts["accountHashtagAdmin"],
    accountHashtagPublisher: namedAccounts["accountHashtagPublisher"],
    accountHashtagPlatform: namedAccounts["accountHashtagPlatform"],
  };

  // Set deployed contract placeholders so they are shareable b/w tests.
  deployed = {
    HashtagAccessControls: {},
    HashtagProtocol: {},
    ERC721HashtagRegistry: {},
  };
});

describe("HashtagAccessControl", function () {
  it("is upgradeable", async function () {
    // Deploy the initial proxy contract.
    deployed.HashtagAccessControls = await upgrades.deployProxy(factories.HashtagAccessControls, { kind: "uups" });
    assert((await deployed.HashtagAccessControls.isAdmin(accounts.accountHashtagAdmin.address)) === true);

    // Upgrade the proxy.
    deployed.HashtagAccessControls = await upgrades.upgradeProxy(
      deployed.HashtagAccessControls.address,
      factories.HashtagAccessControlsUpgrade,
    );

    const deployTxn = deployed.HashtagAccessControls.deployTransaction.hash;
    await expectEvent.inTransaction(deployTxn, artifact.HashtagAccessControlsUpgrade, "Upgraded");
    assert((await deployed.HashtagAccessControls.isAdmin(accounts.accountHashtagAdmin.address)) === true);
    assert((await deployed.HashtagAccessControls.upgradeTest()) === true);
  });
});

describe("HashtagProtocol", function () {
  it("is upgradeable", async function () {
    // Deploy the initial proxy contract.
    deployed.HashtagProtocol = await upgrades.deployProxy(
      factories.HashtagProtocol,
      [deployed.HashtagAccessControls.address, accounts.accountHashtagPlatform.address],
      { kind: "uups" },
    );
    assert((await deployed.HashtagProtocol.name()) === "Hashtag Protocol");
    assert((await deployed.HashtagProtocol.symbol()) === "HASHTAG");

    // Upgrade the proxy.
    deployed.HashtagProtocol = await upgrades.upgradeProxy(
      deployed.HashtagProtocol.address,
      factories.HashtagProtocolUpgrade,
    );

    const deployTxn = deployed.HashtagProtocol.deployTransaction.hash;
    await expectEvent.inTransaction(deployTxn, artifact.HashtagAccessControlsUpgrade, "Upgraded");
    assert((await deployed.HashtagProtocol.name()) === "Hashtag Protocol");
    assert((await deployed.HashtagProtocol.symbol()) === "HASHTAG");
    assert((await deployed.HashtagProtocol.upgradeTest()) === true);
  });
});

describe("ERC721HashtagRegistry", function () {
  it("is upgradeable", async function () {
    // Deploy the initial proxy contract.
    deployed.ERC721HashtagRegistry = await upgrades.deployProxy(
      factories.ERC721HashtagRegistry,
      [deployed.HashtagAccessControls.address, deployed.HashtagProtocol.address],
      { kind: "uups" },
    );

    // Upgrade the proxy.
    deployed.ERC721HashtagRegistry = await upgrades.upgradeProxy(
      deployed.ERC721HashtagRegistry.address,
      factories.ERC721HashtagRegistryUpgrade,
    );
    const deployTxn = deployed.ERC721HashtagRegistry.deployTransaction.hash;
    await expectEvent.inTransaction(deployTxn, artifact.HashtagAccessControlsUpgrade, "Upgraded");
    assert((await deployed.ERC721HashtagRegistry.upgradeTest()) === true);
  });
});
