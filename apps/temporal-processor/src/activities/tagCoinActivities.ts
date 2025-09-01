import axios from "axios";
import type { Address, Hash } from "viem";
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
 * Note: The offchain-api endpoint handles both metadata creation and coin deployment in one call
 */
export async function createTagCoinMetadata(params: {
  tagId: string;
  tagString: string;
  creator: Address;
  coinAddress: Address;
}): Promise<MetadataCreationResult> {
  // This activity is now a no-op since the offchain-api handles metadata internally
  // We keep it for workflow compatibility but it just passes through
  logger.info(
    {
      tagId: params.tagId,
      tagString: params.tagString,
      coinAddress: params.coinAddress,
    },
    "Metadata will be created as part of coin deployment",
  );

  return {
    metadataURI: "handled-by-deploy", // Special marker
    status: "success",
  };
}

/**
 * Activity: Deploy TAG coin on Zora
 * Calls the offchain-api /api/tag-coin/create endpoint
 */
export async function deployTagCoinOnZora(params: {
  tagId: string;
  tagString: string;
  coinAddress: Address;
  metadataURI: string;
  creator: Address;
  displayVersion?: string;
  machineName: string;
  relayer: Address;
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
      "Deploying TAG coin on Zora via offchain-api",
    );

    // Prepare the TagCreatedEventData payload
    const tagData = {
      coinAddress: params.coinAddress,
      originalInput: params.tagString,
      displayVersion: params.displayVersion || params.tagString,
      machineName: params.machineName,
      creator: params.creator,
      relayer: params.relayer,
      timestamp: params.timestamp,
      blockNumber: params.blockNumber,
      transactionHash: params.transactionHash,
    };

    // Call offchain API to deploy on Zora
    const response = await axios.post(
      `${config.services.offchainApiUrl}/api/tag-coin/create`,
      {
        tagData,
        chainId: config.blockchain.chainId,
      },
      {
        timeout: 60000, // 60 seconds for deployment
        headers: {
          "Content-Type": "application/json",
          "x-oracle-key": config.services.oracleApiKey || "local-oracle-key", // Add oracle auth header
        },
      },
    );

    if (response.data.success) {
      logger.info(
        {
          coinAddress: response.data.coinAddress,
          transactionHash: response.data.transactionHash,
          created: response.data.created,
        },
        "Successfully deployed TAG coin on Zora",
      );

      return {
        coinAddress: response.data.coinAddress,
        transactionHash: response.data.transactionHash,
        metadataURI: "", // Not returned by current API
        status: "success",
      };
    }
    throw new Error(response.data.error || "Failed to deploy on Zora");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      {
        coinAddress: params.coinAddress,
        error: errorMessage,
      },
      "Failed to deploy TAG coin on Zora",
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
