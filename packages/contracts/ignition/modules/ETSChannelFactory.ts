import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ETSAccessControlsModule from "./ETSAccessControls.js";
import ETSCoreModule from "./ETSCore.js";
import ETSTargetModule from "./ETSTarget.js";
import ETSTokenModule from "./ETSToken.js";

/**
 * Ignition module for deploying ETSChannelFactory with Beacon Proxy pattern
 *
 * This is a Layer 5 module - depends on the complete ETS system:
 * - ETSAccessControls (via dependencies)
 * - ETSToken (Layer 3)
 * - ETSTarget (Layer 2)
 * - ETS Core (Layer 4)
 *
 * Demonstrates Beacon Proxy pattern (different from UUPS)
 */
const ETSChannelFactoryModule = buildModule("ETSChannelFactory", (m) => {
  // Import the complete ETS system dependencies
  const { etsCore, token, target, accessControls, mockZoraFactory } = m.useModule(ETSCoreModule);

  // Deploy the ETSChannel implementation (logic contract for beacon)
  const channelImplementation = m.contract("ETSChannel", []);

  // Deploy the ETSChannelBeacon separately through Ignition to ensure proper bytecode
  const channelBeacon = m.contract("ETSChannelBeacon", [
    channelImplementation, // address _channelLogic
  ]);

  // Deploy ETSChannelFactory with the pre-deployed beacon
  const channelFactory = m.contract("ETSChannelFactory", [
    channelBeacon, // address _etsChannelBeacon (pre-deployed, not created in constructor)
    accessControls, // IETSAccessControls _etsAccessControls
    etsCore, // IETS _ets
    token, // IETSToken _etsToken
    target, // IETSTarget _etsTarget
  ]);

  return {
    channelFactory,
    channelBeacon,
    channelImplementation,
    // Expose all system components
    etsCore,
    token,
    target,
    accessControls,
    mockZoraFactory,
  };
}) as any;

export default ETSChannelFactoryModule;
