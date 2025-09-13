import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Simple test module for real network deployment verification
 */
export default buildModule("SimpleTest", (m) => {
  const mockZora = m.contract("MockZoraFactory", []);

  return {
    mockZora,
  };
});
