import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for deploying MockZoraFactory contract
 * 
 * This is a Layer 1 module with no dependencies - provides mock Zora factory
 * functionality for testing environments.
 */
const MockZoraFactoryModule = buildModule("MockZoraFactory", (m) => {
  // Deploy MockZoraFactory contract (no constructor arguments)
  const mockZoraFactory = m.contract("MockZoraFactory", []);

  return {
    mockZoraFactory,
  };
}) as any;

export default MockZoraFactoryModule;