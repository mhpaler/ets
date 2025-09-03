import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for deploying ETSAccessControls with UUPS proxy pattern
 *
 * This module can be used for both:
 * 1. Production deployments: npx hardhat ignition deploy ETSAccessControlsModule
 * 2. Test fixtures: await ignition.deploy(ETSAccessControlsModule)
 */
const ETSAccessControlsModule = buildModule("ETSAccessControls", (m) => {
  // Get platform address parameter (with default for tests)
  const platformAddress = m.getParameter("platformAddress", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"); // First account from test mnemonic

  // Deploy the implementation contract
  const accessControlsImplementation = m.contract("ETSAccessControls", []);

  // Deploy UUPS proxy using ERC1967Proxy
  // This is the manual approach since Ignition doesn't have built-in UUPS support yet
  const initializeCalldata = m.encodeFunctionCall(accessControlsImplementation, "initialize", [platformAddress]);

  const accessControlsProxy = m.contract("ERC1967Proxy", [accessControlsImplementation, initializeCalldata], {
    // Give this future a meaningful name
    id: "ETSAccessControlsProxy",
  });

  // Return the proxy as the main contract interface
  // Tests and scripts will interact with this proxy address
  return {
    accessControls: accessControlsProxy,
    implementation: accessControlsImplementation,
  };
}) as any; // Suppress TypeScript error for Ignition internal types

export default ETSAccessControlsModule;
