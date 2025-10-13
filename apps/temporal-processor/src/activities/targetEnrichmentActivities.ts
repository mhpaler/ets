import { http, type Abi, type Hash, createPublicClient, createWalletClient, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { getConfig, targetEnrichmentNonceManager } from "../config/index.js";
import { MetadataExtractor } from "../services/MetadataExtractor.js";
import type { EnrichmentEventResult, MetadataFetchResult } from "../types/index.js";
import type { ETSTargetMetadata } from "../types/metadata.js";
import { getComponentLogger } from "../utils/logger.js";

const logger = getComponentLogger("TargetEnrichmentActivities");

// Define localhost chain with correct configuration
const localChain = defineChain({
  id: 31337,
  name: "Localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
});

// Get chain configuration
function getChain(chainId: number) {
  switch (chainId) {
    case 31337:
      return localChain;
    case 84532:
      return baseSepolia;
    case 8453:
      return base;
    default:
      return localChain;
  }
}

/**
 * Activity: Fetch metadata from target URI
 *
 * This activity uses unfurl.js to extract rich metadata from the target URI.
 * It handles various content types and extracts OpenGraph, Twitter Cards,
 * and basic HTML metadata.
 */
export async function fetchTargetMetadata(params: {
  targetId: string;
  targetURI: string;
}): Promise<ETSTargetMetadata> {
  try {
    logger.info({ targetId: params.targetId, uri: params.targetURI }, "Fetching target metadata");

    // Use our MetadataExtractor
    const extractor = new MetadataExtractor({
      timeout: 10000, // 10 seconds
      maxSize: 5 * 1024 * 1024, // 5MB
    });

    const metadata = await extractor.extract(params.targetURI);

    logger.info(
      {
        targetId: params.targetId,
        type: metadata.type,
        platform: metadata.platform,
        extractionMethod: metadata.core.extractionMethod,
        httpStatus: metadata.core.httpStatus,
      },
      "Successfully extracted metadata",
    );

    return metadata;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ targetId: params.targetId, error: errorMessage }, "Failed to fetch metadata");

    // Return error metadata structure
    const { createErrorMetadata } = await import("../types/metadata.js");
    return createErrorMetadata(params.targetURI, errorMessage);
  }
}

/**
 * Activity: Call enrichTarget function on-chain
 *
 * This activity calls the enrichTarget function on the ETSTarget contract,
 * which then emits an event with the fetched metadata for The Graph to index.
 */
export async function callEnrichTargetOnChain(params: {
  targetId: string;
  metadata: ETSTargetMetadata;
}): Promise<EnrichmentEventResult> {
  try {
    // Load config asynchronously
    const config = await getConfig();

    logger.info({ targetId: params.targetId }, "Calling enrichTarget on-chain");

    // Get private key from config (supports both HD wallet and direct key)
    const privateKey = config.blockchain.eventProcessorPrivateKey;
    if (!privateKey) {
      logger.warn("No private key configured, skipping on-chain enrichment");
      return {
        transactionHash: "0x0" as Hash,
        status: "failed",
        error: "No private key configured for on-chain enrichment",
      };
    }

    // Create wallet client for transactions
    // Include nonceManager to prevent nonce conflicts on concurrent target enrichments
    const account = privateKeyToAccount(privateKey as `0x${string}`, {
      nonceManager: targetEnrichmentNonceManager,
    });
    const chain = getChain(config.blockchain.chainId);

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(config.blockchain.rpcUrl),
    });

    const publicClient = createPublicClient({
      chain,
      transport: http(config.blockchain.rpcUrl),
    });

    // Convert metadata to JSON bytes for on-chain event
    const metadataObj = {
      core: params.metadata.core,
      type: params.metadata.type,
      platform: params.metadata.platform,
      keywords: params.metadata.keywords,
      extensions: params.metadata.extensions,
    };

    // Encode JSON as UTF-8 bytes
    const metadataJson = JSON.stringify(metadataObj);
    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(metadataJson);
    const payloadHex = `0x${Buffer.from(payloadBytes).toString("hex")}`;

    // Schema version for metadata format
    const schemaVersion = "ets-metadata-v1";

    // Load the ABI dynamically
    const { ETSTargetABI } = await import("@ethereum-tag-service/contracts/abis");

    // Use transaction manager for automatic retry with nonce management
    const { executeWithRetry } = await import("../utils/transactionManager.js");

    const hash = await executeWithRetry(
      publicClient,
      walletClient,
      async () => {
        // Simulate the transaction first using the full ETSTargetABI
        const { request } = await publicClient.simulateContract({
          address: config.blockchain.contracts.etsTarget,
          abi: ETSTargetABI as Abi,
          functionName: "enrichTarget",
          args: [BigInt(params.targetId), payloadHex as `0x${string}`, schemaVersion],
          account,
        });

        // Execute the transaction
        return await walletClient.writeContract(request);
      },
      {
        contextInfo: {
          targetId: params.targetId,
          operation: "enrichTarget",
        },
      },
    );

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      logger.info(
        {
          targetId: params.targetId,
          transactionHash: hash,
        },
        "Successfully called enrichTarget on-chain",
      );

      return {
        transactionHash: hash,
        status: "success",
      };
    }

    throw new Error("Transaction reverted");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ targetId: params.targetId, error: errorMessage }, "Failed to call enrichTarget on-chain");

    return {
      transactionHash: "0x0" as Hash,
      status: "failed",
      error: errorMessage,
    };
  }
}
