import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ETSAccessControlsModule from "./ETSAccessControls.js";

/**
 * Ignition module for deploying ETSTarget with UUPS proxy pattern
 * 
 * This is a Layer 2 module - depends on ETSAccessControls
 * Demonstrates module composition using m.useModule()
 */
const ETSTargetModule = buildModule("ETSTarget", (m) => {
  // Import ETSAccessControls dependency
  const { accessControls } = m.useModule(ETSAccessControlsModule);

  // Deploy the ETSTarget implementation contract
  const targetImplementation = m.contract("ETSTarget", []);

  // Deploy UUPS proxy with initialization
  const initializeCalldata = m.encodeFunctionCall(
    targetImplementation,
    "initialize",
    [accessControls] // ETSTarget.initialize(address _accessControlsContract)
  );

  const targetProxy = m.contract("ERC1967Proxy", [
    targetImplementation,
    initializeCalldata,
  ], {
    id: "ETSTargetProxy"
  });

  return {
    target: targetProxy,
    implementation: targetImplementation,
    // Also expose the access controls for other modules to use
    accessControls,
  };
}) as any;

export default ETSTargetModule;