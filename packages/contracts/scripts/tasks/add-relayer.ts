import { task } from "hardhat/config";
import { type Address, getContract, createPublicClient, createWalletClient, http } from "viem";
import { localhost, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

task(
  "addRelayer",
  'Add a relayer to the protocol. eg: hardhat addRelayer --name "MyRelayer" --signer account0 --network localhost'
)
  .addParam("name", 'Relayer name eg. "MyRelayer"')
  .addOptionalParam("signer", 'Signer to use (account0, account1, etc)', "account0")
  .setAction(async (taskArgs, hre) => {
    console.log("====================================");
    console.log("Add Relayer");
    console.log("====================================\n");
    console.log("Network:", hre.network.name);
    console.log("Relayer name:", taskArgs.name);

    // Load network configuration
    const networkConfig = require(`../../src/chainConfig/${hre.network.name}.json`);
    
    // Get the appropriate chain config for viem
    const chain = hre.network.name === "localhost" ? {
      ...localhost,
      id: 31337, // hardhat default chain ID
    } : baseSepolia;
    
    // Create viem public client
    const rpcUrl = hre.network.name === "localhost" ? "http://127.0.0.1:8545" : "https://sepolia.base.org";
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Get hardhat accounts as viem wallet clients
    // For localhost, use hardhat's default accounts
    const defaultPrivateKeys = [
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // account0
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // account1  
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // account2
    ];
    
    const signerIndex = Number.parseInt(taskArgs.signer.replace("account", ""));
    if (signerIndex < 0 || signerIndex >= defaultPrivateKeys.length) {
      console.log("❌ Invalid signer name. Use account0, account1, or account2");
      return;
    }
    
    const account = privateKeyToAccount(defaultPrivateKeys[signerIndex] as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(rpcUrl),
    });
    
    console.log("Using signer:", account.address);
    
    // Get balance using public client
    const balance = await publicClient.getBalance({ address: account.address });
    console.log("Signer balance:", (Number(balance) / 1e18).toFixed(4), "ETH\n");

    // Get contracts using viem
    const etsAccessControls = getContract({
      address: networkConfig.contracts.ETSAccessControls.address as Address,
      abi: networkConfig.contracts.ETSAccessControls.abi,
      client: publicClient,
    });

    // ETSRelayerFactory not needed for reading operations

    // Check if relayer name already exists
    console.log("1. Checking if relayer name is available...");
    const nameExists = await etsAccessControls.read.isRelayerByName([taskArgs.name]);
    
    if (nameExists) {
      console.log("   ❌ Relayer name already exists!");
      
      // Get the existing relayer address
      try {
        const existingAddress = await etsAccessControls.read.getRelayerAddressFromName([taskArgs.name]);
        console.log("   📍 Existing relayer address:", existingAddress);
        
        // Check if it's properly registered
        const isRelayer = await etsAccessControls.read.isRelayer([existingAddress]);
        const isActive = await etsAccessControls.read.isRelayerAndNotPaused([existingAddress]);
        
        console.log("   Registration status:", isRelayer ? "✅ Registered" : "❌ Not registered");
        console.log("   Active status:", isActive ? "✅ Active" : "❌ Paused");
        
        if (isRelayer && isActive) {
          console.log("\n✅ Relayer already exists and is working properly!");
        } else {
          console.log("\n⚠️  Relayer exists but has issues. Consider using checkRelayer task.");
        }
      } catch (error: any) {
        console.log("   ❌ Error getting relayer details:", error.message);
      }
      return;
    }

    console.log("   ✅ Relayer name is available");

    // Check prerequisites
    console.log("\n2. Checking prerequisites...");
    
    // Check if user owns CTAG (if not relayer admin)
    try {
      const isRelayerAdmin = await etsAccessControls.read.isRelayerAdmin([account.address]);
      console.log("   Is relayer admin?", isRelayerAdmin);
      
      if (!isRelayerAdmin) {
        // Check if user already owns a relayer
        const ownsRelayer = await etsAccessControls.read.isRelayerByOwner([account.address]);
        if (ownsRelayer) {
          console.log("   ❌ Account already owns a relayer");
          console.log("   💡 Each account can only own one relayer");
          return;
        }
      }
      
      console.log("   ✅ Prerequisites met");
    } catch (error: any) {
      console.log("   ❌ Error checking prerequisites:", error.message);
      return;
    }

    // Create the relayer
    console.log("\n3. Creating relayer...");
    try {
      // Use viem for transaction
      const etsRelayerFactoryWithWallet = getContract({
        address: networkConfig.contracts.ETSRelayerFactory.address as Address,
        abi: networkConfig.contracts.ETSRelayerFactory.abi,
        client: walletClient,
      });
      
      const txHash = await etsRelayerFactoryWithWallet.write.addRelayer([taskArgs.name]);
      console.log("   📤 Transaction sent:", txHash);
      console.log("   ⏳ Waiting for confirmation...");
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log("   ✅ Transaction confirmed!");
      console.log("   ⛽ Gas used:", receipt.gasUsed.toString());

      // Get the new relayer address
      const newRelayerAddress = await etsAccessControls.read.getRelayerAddressFromName([taskArgs.name]);
      console.log("\n4. Verifying relayer creation...");
      console.log("   📍 New relayer address:", newRelayerAddress);
      
      // Verify registration
      const isRelayer = await etsAccessControls.read.isRelayer([newRelayerAddress]);
      const isActive = await etsAccessControls.read.isRelayerAndNotPaused([newRelayerAddress]);
      
      console.log("   Registration status:", isRelayer ? "✅ Registered" : "❌ Not registered");
      console.log("   Active status:", isActive ? "✅ Active" : "❌ Paused");
      
      if (isRelayer && isActive) {
        console.log("\n🎉 Relayer created successfully!");
        console.log("\n💡 You can now use this relayer:");
        console.log(`   hardhat createTags --tags "#MyTag" --relayer "${taskArgs.name}" --network ${hre.network.name}`);
      } else {
        console.log("\n⚠️  Relayer created but may have issues");
        console.log("   💡 Check status with:");
        console.log(`      hardhat checkRelayer --name "${taskArgs.name}" --network ${hre.network.name}`);
      }
      
    } catch (error: any) {
      console.log("   ❌ Transaction failed:", error.message);
      
      if (error.message.includes("Relayer name exists")) {
        console.log("   💡 Relayer name is already taken");
      } else if (error.message.includes("Sender owns relayer")) {
        console.log("   💡 This account already owns a relayer");
      } else {
        console.log("   💡 Check your account balance and permissions");
      }
    }
  });