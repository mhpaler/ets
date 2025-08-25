import axios from "axios";
import { http, type Hash, createPublicClient, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, localhost, sepolia } from "viem/chains";
import { config } from "../config";
import type { ArweaveUploadResult, BlockchainUpdateResult, MetadataFetchResult } from "../types";
import { getComponentLogger } from "../utils/logger";

const logger = getComponentLogger("TargetEnrichmentActivities");

// Get chain configuration
function getChain() {
  switch (config.blockchain.chainId) {
    case 31337:
      return localhost;
    case 11155111:
      return sepolia;
    case 8453:
      return base;
    default:
      return localhost;
  }
}

/**
 * Activity: Fetch metadata from target URI
 */
export async function fetchTargetMetadata(params: {
  targetId: string;
  targetURI: string;
}): Promise<MetadataFetchResult> {
  try {
    logger.info({ targetId: params.targetId, uri: params.targetURI }, "Fetching target metadata");

    // Call offchain API to fetch and process metadata
    const response = await axios.post(
      `${config.services.offchainApiUrl}/api/targets/fetch-metadata`,
      {
        targetId: params.targetId,
        targetURI: params.targetURI,
      },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.success) {
      logger.info({ targetId: params.targetId }, "Successfully fetched metadata");
      return {
        title: response.data.metadata.title,
        description: response.data.metadata.description,
        image: response.data.metadata.image,
        keywords: response.data.metadata.keywords,
        targetType: response.data.metadata.targetType,
        status: "success",
      };
    }
    throw new Error(response.data.error || "Failed to fetch metadata");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ targetId: params.targetId, error: errorMessage }, "Failed to fetch metadata");

    return {
      status: "failed",
      error: errorMessage,
    };
  }
}

/**
 * Activity: Upload metadata to Arweave
 */
export async function uploadToArweave(params: {
  targetId: string;
  metadata: MetadataFetchResult;
  targetURI: string;
}): Promise<ArweaveUploadResult> {
  try {
    logger.info({ targetId: params.targetId }, "Uploading metadata to Arweave");

    // Call offchain API to upload to Arweave
    const response = await axios.post(
      `${config.services.offchainApiUrl}/api/targets/upload-to-arweave`,
      {
        targetId: params.targetId,
        targetURI: params.targetURI,
        metadata: params.metadata,
      },
      {
        timeout: 60000, // 60 second timeout for upload
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.success) {
      logger.info(
        {
          targetId: params.targetId,
          transactionId: response.data.transactionId,
        },
        "Successfully uploaded to Arweave",
      );

      return {
        transactionId: response.data.transactionId,
        gatewayUrl: `${config.services.arweaveGateway}/${response.data.transactionId}`,
        status: "success",
      };
    }
    throw new Error(response.data.error || "Failed to upload to Arweave");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ targetId: params.targetId, error: errorMessage }, "Failed to upload to Arweave");

    return {
      transactionId: "",
      gatewayUrl: "",
      status: "failed",
      error: errorMessage,
    };
  }
}

/**
 * Activity: Update target on-chain with enriched metadata
 */
export async function updateTargetOnChain(params: {
  targetId: string;
  arweaveTransactionId: string;
  metadataURI: string;
}): Promise<BlockchainUpdateResult> {
  try {
    logger.info({ targetId: params.targetId }, "Updating target on-chain");

    // Check if we have a private key configured
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      logger.warn("No PRIVATE_KEY configured, skipping on-chain update");
      return {
        transactionHash: "0x0" as Hash,
        status: "failed",
        error: "No private key configured for on-chain updates",
      };
    }

    // Create wallet client for transactions
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const chain = getChain();

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(config.blockchain.rpcUrl),
    });

    const publicClient = createPublicClient({
      chain,
      transport: http(config.blockchain.rpcUrl),
    });

    // Prepare the transaction to update target
    // This would call ETSTarget.updateTarget() with EVENT_PROCESSOR_ROLE
    const { request } = await publicClient.simulateContract({
      address: config.blockchain.contracts.etsTarget,
      abi: [
        {
          name: "updateTarget",
          type: "function",
          inputs: [
            { name: "targetId", type: "uint256" },
            { name: "metadataURI", type: "string" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "updateTarget",
      args: [BigInt(params.targetId), params.metadataURI],
      account,
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      logger.info(
        {
          targetId: params.targetId,
          transactionHash: hash,
        },
        "Successfully updated target on-chain",
      );

      return {
        transactionHash: hash,
        status: "success",
      };
    }
    throw new Error("Transaction reverted");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ targetId: params.targetId, error: errorMessage }, "Failed to update on-chain");

    return {
      transactionHash: "0x0" as Hash,
      status: "failed",
      error: errorMessage,
    };
  }
}
