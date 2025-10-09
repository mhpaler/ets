import type { Address, Chain, Hash } from "viem";
import { http, createPublicClient, createWalletClient, keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia, hardhat } from "viem/chains";
import { getConfig } from "../config";
import type { ZoraCoinCreationResult } from "../types";
import { getComponentLogger } from "../utils/logger";

const logger = getComponentLogger("TagCoinActivities");

// Zora Factory address (same across all chains via CREATE2)
const ZORA_FACTORY = "0x777777751622c0d3258f214F9DF38E35BF45baF3" as const;

/**
 * Validate metadata matches Zora's required structure
 * Based on Zora SDK validateMetadataJSON implementation
 */
function validateZoraMetadata(metadata: unknown): void {
  if (typeof metadata !== "object" || !metadata) {
    throw new Error("Metadata must be an object");
  }

  const meta = metadata as Record<string, unknown>;

  // Validate required fields
  if (typeof meta.name !== "string" || !meta.name) {
    throw new Error("Metadata name is required and must be a non-empty string");
  }
  if (typeof meta.description !== "string" || !meta.description) {
    throw new Error("Metadata description is required and must be a non-empty string");
  }
  if (typeof meta.symbol !== "string" || !meta.symbol) {
    throw new Error("Metadata symbol is required and must be a non-empty string");
  }

  // Validate image field
  if (typeof meta.image !== "string" || !meta.image) {
    throw new Error("Metadata image is required and must be a string");
  }

  // Validate URI format (data:, ipfs://, ar://, http://, https://)
  const imageStr = meta.image as string;
  const validPrefixes = ["data:", "ipfs://", "ar://", "http://", "https://"];
  if (!validPrefixes.some((prefix) => imageStr.startsWith(prefix))) {
    throw new Error("Metadata image must be a valid URI (data:, ipfs://, ar://, http://, or https://)");
  }
}

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
 * Generates SVG image and validates with Zora SDK
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
      "Creating TAG coin metadata with SVG",
    );

    // Generate SVG with hashtag text
    const svgText = params.tagString;
    const fontSize = svgText.length > 15 ? "60" : "80"; // Smaller font for longer tags
    const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="#6366f1"/><text x="50%" y="50%" font-size="${fontSize}" font-family="Arial, sans-serif" fill="#ffffff" text-anchor="middle" dy=".3em">${svgText}</text></svg>`;
    const svgBase64 = Buffer.from(svg).toString("base64");

    // Create metadata structure
    // Note: name uses tagString for display, but coin uses machineName for deterministic addressing
    const metadata = {
      name: params.tagString,
      symbol: "ETS", // Must match coin symbol for consistency
      description: `Tradeable token for ${params.tagString} on Ethereum Tag Service`,
      image: `data:image/svg+xml;base64,${svgBase64}`,
    };

    // Validate metadata structure (matches Zora SDK requirements)
    logger.info("Validating metadata structure");
    try {
      validateZoraMetadata(metadata);
      logger.info("Metadata validation passed");
    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : String(validationError);
      logger.error({ error: errorMessage, metadata }, "Metadata validation failed");
      throw new Error(`Invalid metadata structure: ${errorMessage}`);
    }

    // Convert to data URI for inline metadata
    const metadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`;

    logger.info({ metadataUri: `${metadataUri.substring(0, 100)}...` }, "Created and validated inline metadata");

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
 * Activity: Fetch pool configuration from Zora API
 * Returns the pool config bytes needed for coin deployment
 */
export async function fetchPoolConfig(chainId: number): Promise<`0x${string}`> {
  try {
    logger.info({ chainId }, "Fetching pool config from Zora API");

    const poolConfigUrl = new URL("https://api-sdk.zora.engineering/create/content/pool-config");
    poolConfigUrl.searchParams.append("chain_id", chainId.toString());
    // Base Sepolia (84532) only supports ETH, Base Mainnet (8453) can use CREATOR_COIN_OR_ZORA
    const currency = chainId === 84532 ? "ETH" : "CREATOR_COIN_OR_ZORA";
    poolConfigUrl.searchParams.append("currency", currency);
    poolConfigUrl.searchParams.append("starting_market_cap", "HIGH");

    const response = await fetch(poolConfigUrl.toString());

    if (!response.ok) {
      throw new Error(`Pool config API failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { poolConfig?: string };

    if (!data.poolConfig) {
      throw new Error("Pool config missing in API response");
    }

    logger.info({ poolConfig: `${data.poolConfig.substring(0, 50)}...` }, "Pool config fetched successfully");

    return data.poolConfig as `0x${string}`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ error: errorMessage, chainId }, "Failed to fetch pool config");
    throw error;
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
  poolConfig: `0x${string}`; // Now passed from workflow
}): Promise<ZoraCoinCreationResult> {
  try {
    // Load config asynchronously
    const config = await getConfig();

    logger.info(
      {
        coinAddress: params.coinAddress,
        originalInput: params.tagString,
        machineName: params.machineName,
        chainId: config.blockchain.chainId,
      },
      "Deploying TAG coin on Zora factory",
    );

    // Determine chain configuration and factory address
    let chainConfig: Chain;
    let factoryAddress: Address;
    const chainId = config.blockchain.chainId;

    if (chainId === 31337) {
      // Localhost - use MockZoraFactory
      chainConfig = hardhat;
      factoryAddress = config.blockchain.contracts.mockZoraFactory as Address;
      if (!factoryAddress) {
        throw new Error("MockZoraFactory address not configured for localhost");
      }
      logger.info({ factoryAddress }, "Using MockZoraFactory for localhost");
    } else if (chainId === 84532) {
      // Base Sepolia
      chainConfig = baseSepolia;
      factoryAddress = ZORA_FACTORY;
      logger.info({ factoryAddress }, "Using real Zora factory on Base Sepolia");
    } else if (chainId === 8453) {
      // Base Mainnet
      chainConfig = base;
      factoryAddress = ZORA_FACTORY;
      logger.info({ factoryAddress }, "Using real Zora factory on Base Mainnet");
    } else {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    const publicClient = createPublicClient({
      chain: chainConfig,
      transport: http(config.blockchain.rpcUrl),
    });

    // Read Zora configuration from ETSToken contract to match ETS contract's computeCoinAddress
    logger.info("Reading Zora configuration from ETSToken contract...");
    const [zoraCreatorEOA, zoraPlatformReferrer, zoraPoolConfig] = await Promise.all([
      publicClient.readContract({
        address: config.blockchain.contracts.etsToken,
        abi: [
          {
            name: "zoraCreatorEOA",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "address" }],
          },
        ],
        functionName: "zoraCreatorEOA",
      }) as Promise<Address>,
      publicClient.readContract({
        address: config.blockchain.contracts.etsToken,
        abi: [
          {
            name: "zoraPlatformReferrer",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "address" }],
          },
        ],
        functionName: "zoraPlatformReferrer",
      }) as Promise<Address>,
      publicClient.readContract({
        address: config.blockchain.contracts.etsToken,
        abi: [
          {
            name: "zoraPoolConfig",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "bytes" }],
          },
        ],
        functionName: "zoraPoolConfig",
      }) as Promise<`0x${string}`>,
    ]);

    logger.info(
      {
        zoraCreatorEOA,
        zoraPlatformReferrer,
        zoraPoolConfigLength: zoraPoolConfig.length,
      },
      "Read Zora configuration from ETSToken contract",
    );

    // Use the Zora EOA account for deployment (must match contract configuration)
    const account = privateKeyToAccount(config.blockchain.zoraPrivateKey as `0x${string}`);

    // Verify the account matches the configured zoraCreatorEOA
    if (account.address.toLowerCase() !== zoraCreatorEOA.toLowerCase()) {
      throw new Error(
        `Zora account mismatch: wallet=${account.address}, contract=${zoraCreatorEOA}. Check HD_WALLET_POSITION=3`,
      );
    }

    const walletClient = createWalletClient({
      account,
      chain: chainConfig,
      transport: http(config.blockchain.rpcUrl),
    });

    // Generate deterministic salt from machineName (same as ETS contract)
    const coinSalt = keccak256(toBytes(params.machineName));

    logger.info(
      {
        factoryAddress,
        coinSalt,
        machineName: params.machineName,
      },
      "Calling factory deploy function",
    );

    // CRITICAL: Use exact same parameters as ETS contract's computeCoinAddress
    // - name: machineName (lowercase, no #)
    // - symbol: "ETS" (not "TAG")
    // - poolConfig: from ETSToken contract (not API)
    // - platformReferrer: zoraPlatformReferrer from contract (not channel)
    const coinName = params.machineName; // Use machineName, not tagString!
    const coinSymbol = "ETS"; // Use "ETS", not "TAG"!

    // Factory deploy ABI
    const deployAbi = {
      name: "deploy",
      type: "function",
      stateMutability: "payable",
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

    // Predict coin address using contract configuration
    const predictedAddress = await publicClient.readContract({
      address: factoryAddress,
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
      args: [zoraCreatorEOA, coinName, coinSymbol, zoraPoolConfig, zoraPlatformReferrer, coinSalt],
    });

    logger.info({ predictedAddress }, "Predicted coin address from factory");

    // Use transaction manager for automatic retry with nonce management
    const { executeWithRetry } = await import("../utils/transactionManager.js");

    const hash = await executeWithRetry(
      publicClient,
      walletClient,
      async () => {
        // Simulate deployment first to catch errors early
        logger.info("Simulating contract call...");
        await publicClient.simulateContract({
          account,
          address: factoryAddress,
          abi: [deployAbi],
          functionName: "deploy",
          args: [
            params.creator, // payoutRecipient
            [params.creator], // owners
            params.metadataURI, // uri
            coinName, // name (machineName)
            coinSymbol, // symbol ("ETS")
            zoraPoolConfig, // poolConfig (from contract)
            zoraPlatformReferrer, // platformReferrer (from contract)
            "0x0000000000000000000000000000000000000000" as Address, // postDeployHook
            "0x" as `0x${string}`, // postDeployHookData
            coinSalt, // coinSalt
          ],
          value: 0n,
        });

        logger.info("Simulation successful, executing deployment...");

        // Deploy the coin
        return await walletClient.writeContract({
          address: factoryAddress,
          abi: [deployAbi],
          functionName: "deploy",
          args: [
            params.creator, // payoutRecipient
            [params.creator], // owners
            params.metadataURI, // uri
            coinName, // name (machineName)
            coinSymbol, // symbol ("ETS")
            zoraPoolConfig, // poolConfig (from contract)
            zoraPlatformReferrer, // platformReferrer (from contract)
            "0x0000000000000000000000000000000000000000" as Address, // postDeployHook
            "0x" as `0x${string}`, // postDeployHookData
            coinSalt, // coinSalt
          ],
          value: 0n,
        });
      },
      {
        contextInfo: {
          coinAddress: params.coinAddress,
          tagString: params.tagString,
          operation: "deployTagCoin",
        },
      },
    );

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
