import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Generic Ignition module for upgrading ETSToken
 *
 * This module can be reused for all ETSToken upgrades. The contract's VERSION
 * constant tracks which version is deployed.
 *
 * Usage:
 *   npx hardhat ignition deploy ignition/modules/ETSTokenUpgrade.ts \
 *     --network baseSepolia \
 *     --parameters ignition/parameters/etsTokenUpgrade.json
 *
 * Before upgrading:
 *   1. Update VERSION constant in contracts/ETSToken.sol
 *   2. Compile contracts: pnpm compile
 *   3. Run this deployment script
 */
const ETSTokenUpgradeModule = buildModule("ETSTokenUpgrade", (m) => {
  // Get the proxy address from parameters
  const proxyAddress = m.getParameter("proxyAddress");

  // Deploy the new ETSTokenUpgrade implementation (test contract)
  // This deploys the test upgrade contract from contracts/test/UUPSTesting.sol
  // Note: Constructor takes no arguments (UUPS pattern uses initialize())
  // Use unique ID to avoid conflict with existing deployment
  const newImplementation = m.contract("ETSTokenUpgrade", [], {
    id: "ETSTokenUpgradeImplementation",
  });

  // Get reference to the existing proxy
  const proxy = m.contractAt("ETSToken", proxyAddress);

  // Perform the upgrade by calling upgradeTo on the proxy
  m.call(proxy, "upgradeTo", [newImplementation], {
    id: "UpgradeETSToken",
  });

  return {
    upgradedProxy: proxy,
    newImplementation,
  };
});

export default ETSTokenUpgradeModule;
