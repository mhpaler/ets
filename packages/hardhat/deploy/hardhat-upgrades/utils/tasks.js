const { network, upgrades, ethers } = require("hardhat");
const merge = require("lodash.merge");

// Deploys ETSAccessControls.sol, ETSTag.sol & ETS.sol
const deployETSTask = {
  tags: ["deploy_all"],
  priority: 0,
  run: async (ctx) => {
    const { ETSAdmin, ETSPublisher, ETSPlatform } = ctx.accounts;
    const { ETSAccessControls, ETSTag, ETS } = ctx.artifacts;
    let etsAccessControls,
      etsTag,
      ets,
      etsAccessControlsImpl,
      etsTagImpl,
      etsImpl;

    // Deploy ETSAccessControls
    etsAccessControls = await upgrades.deployProxy(ETSAccessControls, { kind: "uups" });
    await etsAccessControls.deployTransaction.wait();
    etsAccessControlsImpl = await upgrades.erc1967.getImplementationAddress(etsAccessControls.address);

    await etsAccessControls.grantRole(
      await etsAccessControls.SMART_CONTRACT_ROLE(),
      ETSAdmin.address,
      {
        from: ETSAdmin.address,
      },
    );
    // add a publisher to the protocol
    await etsAccessControls.grantRole(ethers.utils.id("PUBLISHER"), ETSPublisher.address);
    // Save deployment data to .deployer/[chainid].json
    await ctx.saveContractConfig("ETSAccessControls", etsAccessControls, etsAccessControlsImpl);
    // Verify deployed contracts on block explorer.
    await ctx.verify("ETSAccessControls", etsAccessControls.address, etsAccessControlsImpl, []);

    // Deploy ETSTag
    etsTag = await upgrades.deployProxy(
      ETSTag,
      [etsAccessControls.address, ETSPlatform.address],
      { kind: "uups" },
    );
    await etsTag.deployTransaction.wait();
    etsTagImpl = await upgrades.erc1967.getImplementationAddress(etsTag.address);
    await ctx.saveContractConfig("ETSTag", etsTag, etsTagImpl);
    await ctx.verify("ETSTag", etsTag.address, etsTagImpl, []);

    // Deploy ETS
    ets = await upgrades.deployProxy(
      ETS,
      [etsAccessControls.address, etsTag.address],
      { kind: "uups" },
    );
    await ets.deployTransaction.wait();
    etsImpl = await upgrades.erc1967.getImplementationAddress(ets.address);
    await ctx.saveContractConfig("ETS", ets, etsImpl);
    await ctx.verify("ETS", ets.address, etsImpl, []);
  },
  ensureDependencies: () => {},
};

// Upgrade ETSAccessControls
const upgradeETSAccessControlsTask = {
  tags: ["upgrade_ets_access_controls"],
  priority: 10,
  // Before upgradeProxy is run (below), deployer.js ensures upgrade target
  // exists and passes address along to run function.
  ensureDependencies: (ctx, config) => {
    config = merge(ctx.getDeployConfig(), config);
    const { ETSAccessControls } = config.contracts || {};
    const dependencies = { ETSAccessControls };
    for (const [key, value] of Object.entries(dependencies)) {
      if (!value || !value.address) {
        throw new Error(`${key} contract not found for network ${network.config.chainId}`);
      }
    }
    return dependencies;
  },
  // Upgrade the contract, passing in dependencies as second argument.
  run: async (ctx, { ETSAccessControls }) => {
    const etsAccessControls = await upgrades.upgradeProxy(
      ETSAccessControls.address,
      ctx.artifacts.ETSAccessControls,
    );
    await etsAccessControls.deployTransaction.wait();
    const etsAccessControlsImpl = await upgrades.erc1967.getImplementationAddress(etsAccessControls.address);
    await ctx.saveContractConfig("ETSAccessControls", etsAccessControls, etsAccessControlsImpl);
    // Verify deployed contracts on block explorer.
    await ctx.verify("ETSAccessControls", etsAccessControls.address, etsAccessControlsImpl, []);
  },
};

// Upgrade ETSTag
const upgradeETSTagTask = {
  tags: ["upgrade_ets_tag"],
  priority: 15,
  // Before upgradeProxy is run (below), deployer.js ensures upgrade target
  // exists and passes address along to run function.
  ensureDependencies: (ctx, config) => {
    config = merge(ctx.getDeployConfig(), config);
    const { ETSTag } = config.contracts || {};
    const dependencies = { ETSTag };
    for (const [key, value] of Object.entries(dependencies)) {
      if (!value || !value.address) {
        throw new Error(`${key} contract not found for network ${network.config.chainId}`);
      }
    }
    return dependencies;
  },
  // Upgrade the contract, passing in dependencies as second argument.
  run: async (ctx, { ETSTag }) => {
    const etsTag = await upgrades.upgradeProxy(ETSTag.address, ctx.artifacts.ETSTag);

    await etsTag.deployTransaction.wait();
    const etsTagImpl = await upgrades.erc1967.getImplementationAddress(etsTag.address);
    await ctx.saveContractConfig("ETSTag", etsTag, etsTagImpl);
    // Verify deployed contracts on block explorer.
    await ctx.verify("ETSTag", etsTag.address, etsTagImpl, []);
  },
};

// Upgrade ETS
const upgradeETSTask = {
  tags: ["upgrade_ets"],
  priority: 20,
  // Before upgradeProxy is run (below), deployer.js ensures upgrade target
  // exists and passes address along to run function.
  ensureDependencies: (ctx, config) => {
    config = merge(ctx.getDeployConfig(), config);
    const { ETS } = config.contracts || {};
    const dependencies = { ETS };
    for (const [key, value] of Object.entries(dependencies)) {
      if (!value || !value.address) {
        throw new Error(`${key} contract not found for network ${network.config.chainId}`);
      }
    }
    return dependencies;
  },
  // Upgrade the contract, passing in dependencies as second argument.
  run: async (ctx, { ETS }) => {
    // Upgrade the proxy.
    const ets = await upgrades.upgradeProxy(
      ETS.address,
      ctx.artifacts.ETS,
    );

    await ets.deployTransaction.wait();
    const etsImpl = await upgrades.erc1967.getImplementationAddress(ets.address);
    await ctx.saveContractConfig("ETS", ets, etsImpl);
    // Verify deployed contracts on block explorer.
    await ctx.verify("ETS", ets.address, etsImpl, []);
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
  deployETSTask,
  upgradeETSAccessControlsTask,
  upgradeETSTagTask,
  upgradeETSTask,
];
