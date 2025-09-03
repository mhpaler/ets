import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";
import ETSAccessControlsModule from "./ETSAccessControls.js";
import ETSTokenModule from "./ETSToken.js";
import ETSTargetModule from "./ETSTarget.js";

/**
 * Ignition module for deploying ETS Core with UUPS proxy pattern
 * 
 * This is a Layer 4b module - the central ETS contract that depends on:
 * - ETSAccessControls (via other dependencies)
 * - ETSToken (Layer 3)
 * - ETSTarget (Layer 2)
 * 
 * This is the most complex dependency resolution in the system
 */
const ETSCoreModule = buildModule("ETSCore", (m) => {
  // Import all dependencies - Ignition will resolve the dependency graph
  const { token, accessControls: tokenAccessControls, mockZoraFactory } = m.useModule(ETSTokenModule);
  const { target, accessControls: targetAccessControls } = m.useModule(ETSTargetModule);

  // Note: Both token and target import ETSAccessControls, but Ignition should handle this efficiently
  // We'll use the one from target for consistency (they should be the same instance)
  const accessControls = targetAccessControls;

  // Get fee configuration parameters (with defaults matching setup.ts)
  const taggingFee = m.getParameter("taggingFee", parseEther("0.1")); // 0.1 ETH default
  const platformPercentage = m.getParameter("platformPercentage", 20);
  const relayerPercentage = m.getParameter("relayerPercentage", 30);

  // Deploy the ETS Core implementation contract
  const etsCoreImplementation = m.contract("ETS", []);

  // Deploy UUPS proxy with initialization
  const initializeCalldata = m.encodeFunctionCall(
    etsCoreImplementation,
    "initialize",
    [
      accessControls,       // IETSAccessControls _etsAccessControls
      token,               // IETSToken _etsToken
      target,              // IETSTarget _etsTarget
      taggingFee,          // uint256 _taggingFee
      platformPercentage,  // uint256 _platformPercentage
      relayerPercentage,   // uint256 _relayerPercentage
    ]
  );

  const etsCoreProxy = m.contract("ERC1967Proxy", [
    etsCoreImplementation,
    initializeCalldata,
  ], {
    id: "ETSCoreProxy"
  });

  return {
    etsCore: etsCoreProxy,
    implementation: etsCoreImplementation,
    // Expose all dependencies for comprehensive access
    token,
    target,
    accessControls,
    mockZoraFactory,
  };
}) as any;

export default ETSCoreModule;