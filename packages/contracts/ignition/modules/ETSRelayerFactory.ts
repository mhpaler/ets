import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ETSAccessControlsModule from "./ETSAccessControls.js";
import ETSCoreModule from "./ETSCore.js";
import ETSTargetModule from "./ETSTarget.js";
import ETSTokenModule from "./ETSToken.js";

/**
 * Ignition module for deploying ETSRelayerFactory with Beacon Proxy pattern
 *
 * This is a Layer 5 module - depends on the complete ETS system:
 * - ETSAccessControls (via dependencies)
 * - ETSToken (Layer 3)
 * - ETSTarget (Layer 2)
 * - ETS Core (Layer 4)
 *
 * Demonstrates Beacon Proxy pattern (different from UUPS)
 */
const ETSRelayerFactoryModule = buildModule("ETSRelayerFactory", (m) => {
  // Import the complete ETS system dependencies
  const { etsCore, token, target, accessControls, mockZoraFactory } = m.useModule(ETSCoreModule);

  // Deploy the ETSRelayer implementation (logic contract for beacon)
  const relayerImplementation = m.contract("ETSRelayer", []);

  // Deploy the ETSRelayerBeacon separately through Ignition to ensure proper bytecode
  const relayerBeacon = m.contract("ETSRelayerBeacon", [
    relayerImplementation, // address _relayerLogic
  ]);

  // Deploy ETSRelayerFactory with the pre-deployed beacon
  const relayerFactory = m.contract("ETSRelayerFactory", [
    relayerBeacon,      // address _etsRelayerBeacon (pre-deployed, not created in constructor)
    accessControls,     // IETSAccessControls _etsAccessControls
    etsCore,           // IETS _ets
    token,             // IETSToken _etsToken
    target,            // IETSTarget _etsTarget
  ]);

  return {
    relayerFactory,
    relayerBeacon,
    relayerImplementation,
    // Expose all system components
    etsCore,
    token,
    target,
    accessControls,
    mockZoraFactory,
  };
}) as any;

export default ETSRelayerFactoryModule;
