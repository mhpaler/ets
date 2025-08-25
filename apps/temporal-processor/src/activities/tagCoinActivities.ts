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

    // Call offchain API to create TAG coin metadata
    const response = await axios.post(
      `${config.services.offchainApiUrl}/api/tag-coins/create-metadata`,
      {
        tagId: params.tagId,
        tagString: params.tagString,
        creator: params.creator,
        coinAddress: params.coinAddress,
      },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.success) {
      logger.info(
        {
          tagId: params.tagId,
          metadataURI: response.data.metadataURI,
        },
        "Successfully created TAG coin metadata",
      );

      return {
        metadataURI: response.data.metadataURI,
        status: "success",
      };
    }
    throw new Error(response.data.error || "Failed to create metadata");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      {
        tagId: params.tagId,
        error: errorMessage,
      },
      "Failed to create TAG coin metadata",
    );

    return {
      metadataURI: "",
      status: "failed",
      error: errorMessage,
    };
  }
}

/**
 * Activity: Deploy TAG coin on Zora
 */
export async function deployTagCoinOnZora(params: {
  tagId: string;
  tagString: string;
  coinAddress: Address;
  metadataURI: string;
  creator: Address;
}): Promise<ZoraCoinCreationResult> {
  try {
    logger.info(
      {
        tagId: params.tagId,
        tagString: params.tagString,
        coinAddress: params.coinAddress,
      },
      "Deploying TAG coin on Zora",
    );

    // Call offchain API to deploy on Zora
    const response = await axios.post(
      `${config.services.offchainApiUrl}/api/tag-coins/deploy-on-zora`,
      {
        tagId: params.tagId,
        tagString: params.tagString,
        coinAddress: params.coinAddress,
        metadataURI: params.metadataURI,
        creator: params.creator,
      },
      {
        timeout: 60000, // 60 seconds for deployment
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.success) {
      logger.info(
        {
          tagId: params.tagId,
          coinAddress: response.data.coinAddress,
          transactionHash: response.data.transactionHash,
        },
        "Successfully deployed TAG coin on Zora",
      );

      return {
        coinAddress: response.data.coinAddress,
        transactionHash: response.data.transactionHash,
        metadataURI: params.metadataURI,
        status: "success",
      };
    }
    throw new Error(response.data.error || "Failed to deploy on Zora");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      {
        tagId: params.tagId,
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
