import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for upgrading ETSToken to ETSTokenUpgrade
 *
 * This demonstrates how to handle UUPS upgrades with Ignition
 */
const ETSTokenUpgradeModule = buildModule("ETSTokenUpgrade", (m) => {
  // Get the proxy address from parameters
  const proxyAddress = m.getParameter("proxyAddress");

  // Deploy the new implementation
  const newImplementation = m.contract("ETSTokenUpgrade", []);

  // Get reference to the existing proxy
  const proxy = m.contractAt("ETSToken", proxyAddress);

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

export default ETSTokenUpgradeModule;
