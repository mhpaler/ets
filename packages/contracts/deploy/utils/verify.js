const { network, run } = require("hardhat");
const networkName = network.name;
const chainId = network.config.chainId;

/**
 * Verify a contract on a block scanner.
 * @param {string} name Contract name.
 * @param {object} deployment Deployment artifact
 * @param {string} implementation Address of implementation contract when deploying proxy.
 * @param {array} args Constructor arguments for the verify function.
 *
 * For standard deployments, verify takes the deployed contract address. For upgradable contracts,
 * verify takes the implementation address (not the proxy). This is handled for standard deployments
 * by passing the deployed contract address in as the implementation argument.
 */
async function verify(name, deployment, implementation, args) {
  // Skip verification for local development network
  if (chainId === 31337) {
    console.info(`Skipping verification for ${name} on local network`);
    return;
  }

  // Determine the address to verify
  let addressToVerify;

  // If implementation is a string (direct address), use that
  if (typeof implementation === "string") {
    addressToVerify = implementation;
  }
  // If it's an array (for proxy contracts), use it as args and get address from deployment
  else if (Array.isArray(implementation)) {
    const constructorArgs = implementation;
    addressToVerify = deployment.address;
    return verify(name, deployment, addressToVerify, constructorArgs);
  }
  // Otherwise use implementation as is
  else {
    addressToVerify = implementation;
  }

  // Verify on block explorer for non-local networks
  try {
    console.info(`Verifying ${name} at address ${addressToVerify}`);
    await run("verify:verify", {
      network: networkName,
      address: addressToVerify,
      constructorArguments: args || [],
    });
  } catch (err) {
    console.info("Verification failed", {
      name,
      address: deployment?.address,
      verificationAddress: addressToVerify,
      chainId: chainId,
      args: args || [],
      err,
    });
  }
}

module.exports = { verify };
