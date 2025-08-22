import { task } from "hardhat/config";
import { http, createPublicClient, createWalletClient, keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";

task("createTarget", "Create a new target with a URL")
  .addOptionalParam("url", "Target URL (auto-generates if not provided)")
  .addOptionalParam("signer", "Signer account name (default: account0)")
  .setAction(async ({ url, signer = "account0" }, hre) => {
    const { ethers, deployments } = hre;

    // Hardhat default private keys (for localhost)
    const defaultPrivateKeys = [
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // account0
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // account1
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // account2
    ];

    const signerIndex = Number.parseInt(signer.replace("account", ""));
    if (signerIndex < 0 || signerIndex >= defaultPrivateKeys.length) {
      console.error(`❌ Invalid signer "${signer}". Use account0, account1, or account2`);
      return;
    }

    // Auto-generate URL if not provided - use picsum.photos for real images with metadata
    const targetURL = url || `https://picsum.photos/800/600?random=${Date.now()}`;

    // Create viem clients manually
    const chain = { ...localhost, id: 31337 };
    const rpcUrl = "http://127.0.0.1:8545";
    const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });

    const account = privateKeyToAccount(defaultPrivateKeys[signerIndex] as `0x${string}`);
    const walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });

    console.log("🎯 Creating target:");
    console.log("   URL:", targetURL);
    console.log("   Signer:", signer, `(${account.address})`);

    try {
      // Get ETSTarget contract using ethers
      const etsTargetDeployment = await deployments.get("ETSTarget");
      const ETSTarget = await ethers.getContractAt("ETSTarget", etsTargetDeployment.address);

      // Get expected target ID from contract
      const expectedTargetId = await ETSTarget.computeTargetId(targetURL);
      console.log("   Expected Target ID:", expectedTargetId.toString());

      // Let the contract handle target creation and ID generation
      // The contract will check for duplicates and generate the proper uint256 target ID

      // Create the target using viem wallet client
      const tx = await walletClient.writeContract({
        address: etsTargetDeployment.address as `0x${string}`,
        abi: ETSTarget.interface.fragments.map((f: any) => f.format("json")).map((f: string) => JSON.parse(f)),
        functionName: "createTarget",
        args: [targetURL],
      });
      console.log("📝 Transaction sent:", tx);

      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("✅ Target created in block:", receipt.blockNumber);

      // Find TargetCreated event
      const targetCreatedEvent = receipt.logs.find(
        (log) => log.topics[0] === keccak256(toBytes("TargetCreated(uint256)")),
      );

      if (targetCreatedEvent?.topics[1]) {
        console.log("📢 TargetCreated event emitted");
        console.log("   Target ID:", BigInt(targetCreatedEvent.topics[1]));
      }

      // Wait a moment for Event Processor to pick it up
      console.log("\n⏳ Waiting for Event Processor to detect event...");
      console.log("   (Check event-processor.log for processing status)");
    } catch (error: any) {
      console.error("❌ Error creating target:", error.message);

      // Try to decode the error
      if (error.data) {
        console.log("   Error data:", error.data);

        // Common error signatures
        const errorSignatures: Record<string, string> = {
          "0xcb509a86": "Target already exists",
          "0x8c379a0": "Generic revert with reason string",
        };

        const sig = error.data.substring(0, 10);
        if (errorSignatures[sig]) {
          console.log("   Likely reason:", errorSignatures[sig]);
        }
      }
    }
  });

task("getTarget", "Get target information by target ID")
  .addParam("input", "Target ID (uint256 number)")
  .setAction(async ({ input }, hre) => {
    const { ethers, deployments } = hre;

    // Convert input to BigInt for uint256 target ID
    let targetId: bigint;
    try {
      targetId = BigInt(input);
      console.log("🔍 Looking up target by ID:", targetId);
    } catch (_error) {
      console.error("❌ Invalid target ID. Please provide a valid uint256 number.");
      return;
    }

    try {
      // Get ETSTarget contract using ethers
      const etsTargetDeployment = await deployments.get("ETSTarget");
      const ETSTarget = await ethers.getContractAt("ETSTarget", etsTargetDeployment.address);
      const target = await ETSTarget.getTargetById(targetId);

      console.log("\n✅ Target found:");
      console.log("   URI:", target.targetURI);
      console.log("   Created by:", target.createdBy);
      console.log("   Enriched:", target.enriched.toString());
      console.log("   HTTP Status:", target.httpStatus.toString());
      console.log("   Arweave TX:", target.arweaveTxId || "(not enriched)");

      // Check if enriched
      if (target.enriched > 0) {
        const enrichedDate = new Date(Number(target.enriched) * 1000);
        console.log("   Enriched at:", enrichedDate.toISOString());
      }
    } catch (error: any) {
      console.error("❌ Target not found or error:", error.message);
    }
  });
