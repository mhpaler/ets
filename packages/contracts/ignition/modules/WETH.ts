import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for deploying WETH (Wrapped Ether) contract
 * 
 * This is a Layer 1 module with no dependencies - can be used standalone
 * or composed into larger deployment modules.
 */
const WETHModule = buildModule("WETH", (m) => {
  // Deploy WETH contract (no constructor arguments)
  const weth = m.contract("WETH", []);

  return {
    weth,
  };
}) as any;

export default WETHModule;