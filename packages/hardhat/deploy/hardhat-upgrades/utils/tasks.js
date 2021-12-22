const { network, upgrades, ethers } = require("hardhat");
const merge = require("lodash.merge");

// Deploys HashtagAccessControls.sol, HashtagProtocol.sol & ERC721HashtagRegistry.sol
const deployHTPTask = {
  tags: ["deploy_all"],
  priority: 0,
  run: async (ctx) => {
    const { accountHashtagAdmin, accountHashtagPublisher, accountHashtagPlatform } = ctx.accounts;
    const { HashtagAccessControls, HashtagProtocol, ERC721HashtagRegistry } = ctx.artifacts;
    let hashtagAccessControls,
      hashtagProtocol,
      erc721HashtagRegistry,
      hashtagAccessControlsImpl,
      hashtagProtocolImpl,
      erc721HashtagRegistryImpl;

    // Deploy HashtagAccessControls
    hashtagAccessControls = await upgrades.deployProxy(HashtagAccessControls, { kind: "uups" });
    await hashtagAccessControls.deployTransaction.wait();
    hashtagAccessControlsImpl = await upgrades.erc1967.getImplementationAddress(hashtagAccessControls.address);

    await hashtagAccessControls.grantRole(
      await hashtagAccessControls.SMART_CONTRACT_ROLE(),
      accountHashtagAdmin.address,
      {
        from: accountHashtagAdmin.address,
      },
    );
    // add a publisher to the protocol
    await hashtagAccessControls.grantRole(ethers.utils.id("PUBLISHER"), accountHashtagPublisher.address);
    // Save deployment data to .deployer/[chainid].json
    await ctx.saveContractConfig("HashtagAccessControls", hashtagAccessControls, hashtagAccessControlsImpl);
    // Verify deployed contracts on block explorer.
    await ctx.verify("HashtagAccessControls", hashtagAccessControls.address, hashtagAccessControlsImpl, []);

    // Deploy HashtagProtocol
    hashtagProtocol = await upgrades.deployProxy(
      HashtagProtocol,
      [hashtagAccessControls.address, accountHashtagPlatform.address],
      { kind: "uups" },
    );
    await hashtagProtocol.deployTransaction.wait();
    hashtagProtocolImpl = await upgrades.erc1967.getImplementationAddress(hashtagProtocol.address);
    await ctx.saveContractConfig("HashtagProtocol", hashtagProtocol, hashtagProtocolImpl);
    await ctx.verify("HashtagProtocol", hashtagProtocol.address, hashtagProtocolImpl, []);

    // Deploy ERC721HashtagRegistry
    erc721HashtagRegistry = await upgrades.deployProxy(
      ERC721HashtagRegistry,
      [hashtagAccessControls.address, hashtagProtocol.address],
      { kind: "uups" },
    );
    await erc721HashtagRegistry.deployTransaction.wait();
    erc721HashtagRegistryImpl = await upgrades.erc1967.getImplementationAddress(erc721HashtagRegistry.address);
    await ctx.saveContractConfig("ERC721HashtagRegistry", erc721HashtagRegistry, erc721HashtagRegistryImpl);
    await ctx.verify("ERC721HashtagRegistry", erc721HashtagRegistry.address, erc721HashtagRegistryImpl, []);
  },
  ensureDependencies: () => {},
};

// Upgrade HashtagAccessControls
const upgradeHashtagAccessControlsTask = {
  tags: ["upgrade_hashtag_access_controls"],
  priority: 10,
  // Before upgradeProxy is run (below), deployer.js ensures upgrade target
  // exists and passes address along to run function.
  ensureDependencies: (ctx, config) => {
    config = merge(ctx.getDeployConfig(), config);
    const { HashtagAccessControls } = config.contracts || {};
    const dependencies = { HashtagAccessControls };
    for (const [key, value] of Object.entries(dependencies)) {
      if (!value || !value.address) {
        throw new Error(`${key} contract not found for network ${network.config.chainId}`);
      }
    }
    return dependencies;
  },
  // Upgrade the contract, passing in dependencies as second argument.
  run: async (ctx, { HashtagAccessControls }) => {
    const hashtagAccessControls = await upgrades.upgradeProxy(
      HashtagAccessControls.address,
      ctx.artifacts.HashtagAccessControls,
    );
    await hashtagAccessControls.deployTransaction.wait();
    const hashtagAccessControlsImpl = await upgrades.erc1967.getImplementationAddress(hashtagAccessControls.address);
    await ctx.saveContractConfig("HashtagAccessControls", hashtagAccessControls, hashtagAccessControlsImpl);
    // Verify deployed contracts on block explorer.
    await ctx.verify("HashtagAccessControls", hashtagAccessControls.address, hashtagAccessControlsImpl, []);
  },
};

// Upgrade HashtagProtocol
const upgradeHashtagProtocolTask = {
  tags: ["upgrade_hashtag_protocol"],
  priority: 15,
  // Before upgradeProxy is run (below), deployer.js ensures upgrade target
  // exists and passes address along to run function.
  ensureDependencies: (ctx, config) => {
    config = merge(ctx.getDeployConfig(), config);
    const { HashtagProtocol } = config.contracts || {};
    const dependencies = { HashtagProtocol };
    for (const [key, value] of Object.entries(dependencies)) {
      if (!value || !value.address) {
        throw new Error(`${key} contract not found for network ${network.config.chainId}`);
      }
    }
    return dependencies;
  },
  // Upgrade the contract, passing in dependencies as second argument.
  run: async (ctx, { HashtagProtocol }) => {
    const hashtagProtocol = await upgrades.upgradeProxy(HashtagProtocol.address, ctx.artifacts.HashtagProtocol);

    await hashtagProtocol.deployTransaction.wait();
    const hashtagProtocolImpl = await upgrades.erc1967.getImplementationAddress(hashtagProtocol.address);
    await ctx.saveContractConfig("HashtagProtocol", hashtagProtocol, hashtagProtocolImpl);
    // Verify deployed contracts on block explorer.
    await ctx.verify("HashtagProtocol", hashtagProtocol.address, hashtagProtocolImpl, []);
  },
};

// Upgrade ERC721HashtagRegistry
const upgradeERC721TaggingRegistryTask = {
  tags: ["upgrade_erc721_tagging_registry"],
  priority: 20,
  // Before upgradeProxy is run (below), deployer.js ensures upgrade target
  // exists and passes address along to run function.
  ensureDependencies: (ctx, config) => {
    config = merge(ctx.getDeployConfig(), config);
    const { ERC721HashtagRegistry } = config.contracts || {};
    const dependencies = { ERC721HashtagRegistry };
    for (const [key, value] of Object.entries(dependencies)) {
      if (!value || !value.address) {
        throw new Error(`${key} contract not found for network ${network.config.chainId}`);
      }
    }
    return dependencies;
  },
  // Upgrade the contract, passing in dependencies as second argument.
  run: async (ctx, { ERC721HashtagRegistry }) => {
    // Upgrade the proxy.
    const erc721HashtagRegistry = await upgrades.upgradeProxy(
      ERC721HashtagRegistry.address,
      ctx.artifacts.ERC721HashtagRegistry,
    );

    await erc721HashtagRegistry.deployTransaction.wait();
    const erc721HashtagRegistryImpl = await upgrades.erc1967.getImplementationAddress(erc721HashtagRegistry.address);
    await ctx.saveContractConfig("ERC721HashtagRegistry", erc721HashtagRegistry, erc721HashtagRegistryImpl);
    // Verify deployed contracts on block explorer.
    await ctx.verify("ERC721HashtagRegistry", erc721HashtagRegistry.address, erc721HashtagRegistryImpl, []);
  },
};

// eslint-disable-next-line no-unused-vars
function sleep(ms) {
  return new Promise((resolve) => {
    console.log("pausing ", ms / 1000);
    setTimeout(resolve, ms);
  });
}

module.exports = [
  deployHTPTask,
  upgradeHashtagAccessControlsTask,
  upgradeHashtagProtocolTask,
  upgradeERC721TaggingRegistryTask,
];
