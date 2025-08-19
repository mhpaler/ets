import { task } from "hardhat/config";
import { http, type Address, createPublicClient, getContract } from "viem";
import { baseSepolia, localhost } from "viem/chains";

task(
  "checkRelayer",
  "Check if a relayer is properly registered and functioning. eg: hardhat checkRelayer --name ETSRelayer --network localhost",
)
  .addParam("name", 'Relayer name to check eg. "ETSRelayer"')
  .addOptionalParam("address", "Relayer address to check (if known)")
  .setAction(async (taskArgs, hre) => {
    // Load network configuration
    const networkConfig = require(`../../src/chainConfig/${hre.network.name}.json`);

    // Get the appropriate chain config for viem
    const chain = hre.network.name === "localhost" ? localhost : baseSepolia;

    // Create viem public client
    const publicClient = createPublicClient({
      chain,
      transport: http(hre.network.config.url || "http://127.0.0.1:8545"),
    });

    // Get signers using hardhat (we'll still need this for now)
    const [_signer] = await hre.ethers.getSigners();

    console.log("====================================");
    console.log("Check Relayer Registration");
    console.log("====================================\n");
    console.log("Network:", hre.network.name);
    console.log("Checking relayer:", taskArgs.name);

    // Get ETSAccessControls contract using viem
    const etsAccessControls = getContract({
      address: networkConfig.contracts.ETSAccessControls.address as Address,
      abi: networkConfig.contracts.ETSAccessControls.abi,
      client: publicClient,
    });

    // Check if relayer exists by name
    console.log("\n1. Checking relayer by name...");
    const existsByName = await etsAccessControls.read.isRelayerByName([taskArgs.name]);
    console.log(`   isRelayerByName("${taskArgs.name}"):`, existsByName);

    let relayerAddress: Address | undefined;

    // Try to get relayer address
    if (taskArgs.address) {
      relayerAddress = taskArgs.address as Address;
      console.log(`   Using provided address: ${relayerAddress}`);
    } else if (existsByName) {
      // Try to get address from name
      try {
        relayerAddress = (await etsAccessControls.read.getRelayerAddressFromName([taskArgs.name])) as Address;
        console.log(`   Found relayer address: ${relayerAddress}`);
      } catch (_error) {
        console.log("   Could not get relayer address from name");
      }
    } else if (networkConfig.contracts[taskArgs.name]) {
      // Check if it's in the chainConfig
      relayerAddress = networkConfig.contracts[taskArgs.name].address as Address;
      console.log(`   Found in chainConfig: ${relayerAddress}`);
    }

    if (!relayerAddress) {
      console.log("\n❌ Relayer not found!");
      console.log("   The relayer may not exist or may not be registered.");
      return;
    }

    // Check registration status
    console.log("\n2. Checking registration status...");
    const isRelayer = await etsAccessControls.read.isRelayer([relayerAddress]);
    console.log(`   isRelayer(${relayerAddress}):`, isRelayer);

    // Check if address is a relayer and not paused
    const isRelayerAndNotPaused = await etsAccessControls.read.isRelayerAndNotPaused([relayerAddress]);
    console.log("   isRelayerAndNotPaused:", isRelayerAndNotPaused);

    // Check roles
    console.log("\n3. Checking roles...");
    const RELAYER_ROLE = await etsAccessControls.read.RELAYER_ROLE();
    const hasRelayerRole = await etsAccessControls.read.hasRole([RELAYER_ROLE, relayerAddress]);
    console.log("   Has RELAYER_ROLE:", hasRelayerRole);

    // Get relayer contract if it exists
    if (relayerAddress && isRelayer) {
      console.log("\n4. Checking relayer contract state...");

      try {
        // Try to interact with the relayer contract
        const relayerAbi = networkConfig.contracts[taskArgs.name]?.abi || networkConfig.contracts.ETSRelayer?.abi;

        if (relayerAbi) {
          const relayerContract = getContract({
            address: relayerAddress,
            abi: relayerAbi,
            client: publicClient,
          });

          // Check if paused
          const isPaused = await relayerContract.read.isPaused();
          console.log("   Is paused:", isPaused);

          // Get relayer name
          const relayerName = await relayerContract.read.getRelayerName();
          console.log("   Relayer name from contract:", relayerName);

          // Get owner
          const owner = await relayerContract.read.getOwner();
          console.log("   Owner:", owner);

          // Get creator
          const creator = await relayerContract.read.getCreator();
          console.log("   Creator:", creator);
        }
      } catch (error: any) {
        console.log("   Could not query relayer contract:", error.message);
      }
    }

    // Summary
    console.log("\n====================================");
    if (isRelayer && isRelayerAndNotPaused) {
      console.log("✅ Relayer is properly registered and active!");
    } else if (isRelayer && !isRelayerAndNotPaused) {
      console.log("⚠️  Relayer is registered but PAUSED!");
    } else {
      console.log("❌ Relayer is NOT properly registered!");
      console.log("\nTo fix this, you may need to:");
      console.log("1. Run: hardhat addRelayer --name", taskArgs.name);
      console.log("2. Or check deployment scripts if this should be auto-registered");
    }
  });
