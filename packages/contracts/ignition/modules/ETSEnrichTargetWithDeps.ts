import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for deploying ETSEnrichTarget with provided dependencies
 *
 * This module accepts existing AccessControls and Target contracts
 * rather than creating new ones, allowing it to integrate with an
 * existing ETS deployment.
 */
const ETSEnrichTargetWithDepsModule = buildModule("ETSEnrichTargetWithDeps", (m) => {
  // Accept existing contracts as parameters
  const accessControls = m.getParameter("accessControls");
  const target = m.getParameter("target");

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
  };
}) as any;

export default ETSEnrichTargetWithDepsModule;
