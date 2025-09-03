import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ETSAccessControlsModule from "./ETSAccessControls.js";
import ETSTargetModule from "./ETSTarget.js";

/**
 * Ignition module for deploying ETSEnrichTarget with UUPS proxy pattern
 *
 * This is a Layer 4a module - depends on:
 * - ETSAccessControls (via ETSTarget dependency chain)
 * - ETSTarget (Layer 2)
 *
 * Demonstrates complex dependency resolution
 */
const ETSEnrichTargetModule = buildModule("ETSEnrichTarget", (m) => {
  // Import dependencies - ETSTarget will automatically bring in ETSAccessControls
  const { target, accessControls } = m.useModule(ETSTargetModule);

  // Deploy the ETSEnrichTarget implementation contract
  const enrichTargetImplementation = m.contract("ETSEnrichTarget", []);

  // Deploy UUPS proxy with initialization
  const initializeCalldata = m.encodeFunctionCall(enrichTargetImplementation, "initialize", [
    accessControls, // IETSAccessControls _etsAccessControls
    target, // IETSTarget _etsTarget
  ]);

  const enrichTargetProxy = m.contract("ERC1967Proxy", [enrichTargetImplementation, initializeCalldata], {
    id: "ETSEnrichTargetProxy",
  });

  return {
    enrichTarget: enrichTargetProxy,
    implementation: enrichTargetImplementation,
    // Expose dependencies for other modules
    target,
    accessControls,
  };
}) as any;

export default ETSEnrichTargetModule;
