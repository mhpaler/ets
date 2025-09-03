import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for upgrading ETSAccessControls to ETSAccessControlsUpgrade
 *
 * This demonstrates how to handle UUPS upgrades with Ignition
 */
const ETSAccessControlsUpgradeModule = buildModule("ETSAccessControlsUpgrade", (m) => {
  // Get the proxy address from parameters
  const proxyAddress = m.getParameter("proxyAddress");

  // Deploy the new implementation
  const newImplementation = m.contract("ETSAccessControlsUpgrade", []);

  // Get reference to the existing proxy
  const proxy = m.contractAt("ETSAccessControls", proxyAddress);

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

export default ETSAccessControlsUpgradeModule;
