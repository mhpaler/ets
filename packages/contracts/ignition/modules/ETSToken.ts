import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ETSAccessControlsModule from "./ETSAccessControls.js";
import MockZoraFactoryModule from "./MockZoraFactory.js";

/**
 * Ignition module for deploying ETSToken with UUPS proxy pattern
 * 
 * This is a Layer 3 module - depends on:
 * - ETSAccessControls (Layer 1 via Layer 2)
 * - MockZoraFactory (Layer 1)
 * 
 * Demonstrates complex multi-dependency module composition
 */
const ETSTokenModule = buildModule("ETSToken", (m) => {
  // Import dependencies
  const { accessControls } = m.useModule(ETSAccessControlsModule);
  const { mockZoraFactory } = m.useModule(MockZoraFactoryModule);

  // Get configuration parameters (with sensible defaults)
  const tagMinStringLength = m.getParameter("tagMinStringLength", 2);
  const tagMaxStringLength = m.getParameter("tagMaxStringLength", 32);
  const zoraCreatorEOA = m.getParameter("zoraCreatorEOA", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"); // Test account
  const zoraPlatformReferrer = m.getParameter("zoraPlatformReferrer", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  const zoraPoolConfig = m.getParameter("zoraPoolConfig", "0x"); // Empty bytes for tests

  // Deploy the ETSToken implementation contract
  const tokenImplementation = m.contract("ETSToken", []);

  // Deploy UUPS proxy with initialization
  const initializeCalldata = m.encodeFunctionCall(
    tokenImplementation,
    "initialize",
    [
      accessControls,           // IETSAccessControls _etsAccessControls
      tagMinStringLength,       // uint256 _tagMinStringLength
      tagMaxStringLength,       // uint256 _tagMaxStringLength  
      mockZoraFactory,          // address _zoraFactoryAddress
      zoraCreatorEOA,          // address _zoraCreatorEOA
      zoraPlatformReferrer,    // address _zoraPlatformReferrer
      zoraPoolConfig,          // bytes memory _zoraPoolConfig
    ]
  );

  const tokenProxy = m.contract("ERC1967Proxy", [
    tokenImplementation,
    initializeCalldata,
  ], {
    id: "ETSTokenProxy"
  });

  return {
    token: tokenProxy,
    implementation: tokenImplementation,
    // Expose dependencies for other modules
    accessControls,
    mockZoraFactory,
  };
}) as any;

export default ETSTokenModule;