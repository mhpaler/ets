import type { Address, Hash } from "viem";
import { http, createPublicClient, createWalletClient, encodeAbiParameters, keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat, localhost } from "viem/chains";
import { config } from "../config";
import type { ZoraCoinCreationResult } from "../types";
import { getComponentLogger } from "../utils/logger";

const logger = getComponentLogger("TagCoinActivities");

interface MetadataCreationResult {
  metadataURI: string;
  status: "success" | "failed";
  error?: string;
}

interface RewardsAllocationResult {
  status: "success" | "failed";
  transactionHash?: Hash;
  error?: string;
}

/**
 * Activity: Create metadata for TAG coin
 * Creates simple inline metadata for MVP (no IPFS needed)
 */
export async function createTagCoinMetadata(params: {
  tagId: string;
  tagString: string;
  creator: Address;
  coinAddress: Address;
}): Promise<MetadataCreationResult> {
  try {
    logger.info(
      {
        tagId: params.tagId,
        tagString: params.tagString,
        coinAddress: params.coinAddress,
      },
      "Creating TAG coin metadata",
    );

    // Create simple metadata JSON for MVP
    const metadata = {
      name: `TAG: ${params.tagString.replace("#", "")}`,
      symbol: "ETS",
      description: `ETS TAG coin for ${params.tagString}`,
      image: "https://ets.link/logo.png", // Placeholder image
      attributes: [
        {
          trait_type: "Platform",
          value: "ETS",
        },
        {
          trait_type: "Creator",
          value: params.creator,
        },
        {
          trait_type: "Tag",
          value: params.tagString,
        },
      ],
    };

    // Convert to data URI for inline metadata (no IPFS needed for MVP)
    const metadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`;

    logger.info({ metadataUri: `${metadataUri.substring(0, 100)}...` }, "Created inline metadata");

    return {
      metadataURI: metadataUri,
      status: "success",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ error: errorMessage }, "Failed to create metadata");
    return {
      metadataURI: "",
      status: "failed",
      error: errorMessage,
    };
  }
}

/**
 * Activity: Deploy TAG coin on Zora/MockZoraFactory
 * Directly deploys to the factory contract (localhost uses MockZoraFactory)
 */
export async function deployTagCoinOnZora(params: {
  tagId: string;
  tagString: string;
  coinAddress: Address;
  metadataURI: string;
  creator: Address;
  displayVersion?: string;
  machineName: string;
  channel: Address;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}): Promise<ZoraCoinCreationResult> {
  try {
    logger.info(
      {
        coinAddress: params.coinAddress,
        originalInput: params.tagString,
        machineName: params.machineName,
      },
      "Deploying TAG coin on Zora/MockZoraFactory",
    );

    // Setup clients for blockchain interaction
    // Use hardhat chain for proper chainId (31337)
    const chainConfig = config.blockchain.chainId === 31337 ? hardhat : localhost;

    const publicClient = createPublicClient({
      chain: chainConfig,
      transport: http(config.blockchain.rpcUrl),
    });

    // Use the Zora private key for TAG coin deployment (Position 3: ETSZora)
    const account = privateKeyToAccount(config.blockchain.zoraPrivateKey as `0x${string}`);

    const walletClient = createWalletClient({
      account,
      chain: chainConfig,
      transport: http(config.blockchain.rpcUrl),
    });

    // Generate deterministic salt from machineName (same as ETS contract)
    const coinSalt = keccak256(toBytes(params.machineName));

    // Prepare pool configuration (standard ETH pool for MVP)
    const poolConfig = encodeAbiParameters(
      [{ type: "uint256" }],
      [0n], // Standard pool config
    );

    // Get factory address (MockZoraFactory for localhost)
    const factoryAddress = config.blockchain.contracts.mockZoraFactory;
    if (!factoryAddress) {
      throw new Error("MockZoraFactory address not configured");
    }

    logger.info(
      {
        factoryAddress,
        coinSalt,
        machineName: params.machineName,
      },
      "Calling factory deploy function",
    );

    // Factory deploy ABI
    const deployAbi = {
      name: "deploy",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "payoutRecipient", type: "address" },
        { name: "owners", type: "address[]" },
        { name: "uri", type: "string" },
        { name: "name", type: "string" },
        { name: "symbol", type: "string" },
        { name: "poolConfig", type: "bytes" },
        { name: "platformReferrer", type: "address" },
        { name: "postDeployHook", type: "address" },
        { name: "postDeployHookData", type: "bytes" },
        { name: "coinSalt", type: "bytes32" },
      ],
      outputs: [{ name: "coin", type: "address" }],
    } as const;

    // Check if coin already exists (by checking predicted address)
    const predictedAddress = await publicClient.readContract({
      address: factoryAddress as Address,
      abi: [
        {
          name: "coinAddress",
          type: "function",
          stateMutability: "view",
          inputs: [
            { name: "msgSender", type: "address" },
            { name: "name", type: "string" },
            { name: "symbol", type: "string" },
            { name: "poolConfig", type: "bytes" },
            { name: "platformReferrer", type: "address" },
            { name: "coinSalt", type: "bytes32" },
          ],
          outputs: [{ name: "", type: "address" }],
        },
      ],
      functionName: "coinAddress",
      args: [
        account.address,
        `TAG: ${params.tagString.replace("#", "")}`,
        "ETS",
        poolConfig,
        params.channel, // Use channel as platform referrer
        coinSalt,
      ],
    });

    logger.info({ predictedAddress }, "Predicted coin address from factory");

    // Deploy the coin
    const hash = await walletClient.writeContract({
      address: factoryAddress as Address,
      abi: [deployAbi],
      functionName: "deploy",
      args: [
        params.creator, // payoutRecipient
        [params.creator], // owners (just creator for MVP)
        params.metadataURI, // uri
        `TAG: ${params.tagString.replace("#", "")}`, // name
        "ETS", // symbol
        poolConfig, // poolConfig
        params.channel, // platformReferrer (channel that created the tag)
        "0x0000000000000000000000000000000000000000" as Address, // postDeployHook (none)
        "0x" as `0x${string}`, // postDeployHookData (empty)
        coinSalt, // coinSalt
      ],
    });

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      logger.info(
        {
          coinAddress: predictedAddress,
          transactionHash: hash,
        },
        "Successfully deployed TAG coin",
      );

      return {
        coinAddress: predictedAddress,
        transactionHash: hash,
        metadataURI: params.metadataURI,
        status: "success",
      };
    }

    throw new Error("Transaction failed");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      {
        coinAddress: params.coinAddress,
        error: errorMessage,
      },
      "Failed to deploy TAG coin",
    );

    return {
      coinAddress: "0x0" as Address,
      transactionHash: "0x0" as Hash,
      metadataURI: "",
      status: "failed",
      error: errorMessage,
    };
  }
}

/**
 * Activity: Allocate creator rewards
 *
 * Note: This is a placeholder for future implementation
 * Will integrate with issue #533 - Build creator allocation and distribution system
 */
export async function allocateCreatorRewards(params: {
  tagId: string;
  coinAddress: Address;
  creator: Address;
  amount: string;
}): Promise<RewardsAllocationResult> {
  try {
    logger.info(
      {
        tagId: params.tagId,
        coinAddress: params.coinAddress,
        creator: params.creator,
        amount: params.amount,
      },
      "Allocating creator rewards",
    );

    // Placeholder implementation
    // In the future, this will:
    // 1. Calculate reward amounts based on tokenomics
    // 2. Mint initial coin supply to creator
    // 3. Set up vesting schedule if applicable
    // 4. Record allocation in rewards tracking system

    logger.warn({ tagId: params.tagId }, "Creator rewards allocation not yet implemented (see issue #533)");

    return {
      status: "success", // Return success for now to not block workflow
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      {
        tagId: params.tagId,
        error: errorMessage,
      },
      "Failed to allocate creator rewards",
    );

    return {
      status: "failed",
      error: errorMessage,
    };
  }
}
