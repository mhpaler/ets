import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for upgrading ETS (Core) to ETSUpgrade
 *
 * This demonstrates how to handle UUPS upgrades with Ignition
 */
const ETSUpgradeModule = buildModule("ETSUpgrade", (m) => {
  // Get the proxy address from parameters
  const proxyAddress = m.getParameter("proxyAddress");

  // Deploy the new implementation
  const newImplementation = m.contract("ETSUpgrade", []);

  // Get reference to the existing proxy
  const proxy = m.contractAt("ETS", proxyAddress);

  // Perform the upgrade by calling upgradeTo on the proxy
  m.call(proxy, "upgradeTo", [newImplementation], {
    id: "UpgradeCall",
  });

  // Return both the upgraded proxy (now with new implementation) and new implementation
  return {
    upgradedProxy: proxy,
    newImplementation,
  };
}) as any;

export default ETSUpgradeModule;
