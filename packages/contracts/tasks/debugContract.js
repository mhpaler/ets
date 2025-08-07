const { task } = require("hardhat/config");

task("debugContract", "Debug the ETSEnrichTarget contract").setAction(async (_, hre) => {
  try {
    console.info("=== Contract Debugging ===");

    // Get network configuration
    const networkConfig = require(`../src/chainConfig/${hre.network.name}.json`);
    const contractAddress = networkConfig.contracts.ETSEnrichTarget.address;

    console.info(`Contract address: ${contractAddress}`);

    // Get a signer
    const [signer] = await hre.ethers.getSigners();
    console.info(`Using signer: ${signer.address}`);

    // Create a minimal ABI for the functions we need
    const abi = [
      "function airnode() view returns (address)",
      "function NAME() view returns (string)",
      "function requestEnrichTarget(uint256 _targetId) external",
    ];

    // Create contract instance with ethers v6 style
    const contract = new hre.ethers.Contract(contractAddress, abi, signer);

    // Get the contract code at the address
    const code = await hre.ethers.provider.getCode(contractAddress);
    console.info(`Contract code length: ${code.length}`);
    console.info(`Contract code exists: ${code !== "0x"}`);

    // Try to call view functions
    try {
      const airnode = await contract.airnode();
      console.info(`Airnode address: ${airnode}`);
    } catch (error) {
      console.error("Error calling airnode():", error.message);
    }

    try {
      const name = await contract.NAME();
      console.info(`Contract NAME: ${name}`);
    } catch (error) {
      console.error("Error calling NAME():", error.message);
    }

    // Try to call the requestEnrichTarget function
    const targetId = "66970359841036948517769269395685321134451577895751556947483004888163188906780";
    console.info(`Calling requestEnrichTarget with targetId: ${targetId}`);

    // Explicitly encode the function call to debug
    const functionFragment = contract.interface.getFunction("requestEnrichTarget");
    const encodedData = contract.interface.encodeFunctionData(functionFragment, [targetId]);
    console.info(`Encoded function call: ${encodedData}`);

    // Send the transaction with explicit parameters
    const tx = await signer.sendTransaction({
      to: contractAddress,
      data: encodedData,
      gasLimit: 500000,
    });

    console.info(`Transaction sent: ${tx.hash}`);
    console.info("Waiting for transaction confirmation...");

    const receipt = await tx.wait();
    console.info(`Transaction status: ${receipt.status === 1 ? "Success" : "Failed"}`);

    if (receipt.status === 1) {
      console.info("Transaction successful!");
    } else {
      console.info("Transaction failed!");
    }
  } catch (error) {
    console.error("Debug error:", error);

    // More detailed error information
    if (error.transaction) {
      console.info("Transaction details:");
      console.info(`  To: ${error.transaction.to}`);
      console.info(`  From: ${error.transaction.from}`);
      console.info(`  Data: ${error.transaction.data || "empty"}`);
      console.info(`  Gas limit: ${error.transaction.gasLimit || "not set"}`);
    }

    if (error.receipt) {
      console.info("Receipt details:");
      console.info(`  Status: ${error.receipt.status}`);
      console.info(`  Gas used: ${error.receipt.gasUsed}`);
    }
  }
});

module.exports = {};
