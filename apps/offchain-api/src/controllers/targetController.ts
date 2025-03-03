import { createTargetClient } from "@ethereum-tag-service/sdk-core";
import type { NextFunction, Request, Response } from "express";
import { metadataService } from "../services/target/metadataService";
import { AppError } from "../utils/errorHandler";
import { logger } from "../utils/logger";

/**
 * Process a target URL and return enrichment data
 * This endpoint doesn't make any blockchain transactions
 */
export const processTarget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chainId, targetId } = req.body;

    if (!targetId) {
      return next(new AppError("Target ID is required", 400));
    }

    logger.info(`Processing target ${targetId} on chain ${chainId}`);

    // Create SDK Core client for Target contract (read-only)
    const targetClient = createTargetClient({ chainId });

    if (!targetClient) {
      return next(new AppError(`Failed to create client for chain ${chainId}`, 500));
    }

    // First check if the target exists
    logger.info(`Checking if target ${targetId} exists`);
    const targetExists = await targetClient.targetExistsById(targetId);

    if (!targetExists) {
      return next(new AppError("Invalid targetId", 400));
    }

    // Get the target information from the blockchain
    logger.info(`Fetching target details for ID ${targetId}`);
    const target = await targetClient.getTargetById(targetId);
    const targetUrl = target.targetURI;

    if (!targetUrl) {
      return next(new AppError("Target URL is empty", 400));
    }

    logger.info(`Processing target URL: ${targetUrl}`);

    // Process the target URL - extract metadata and upload to Arweave
    const { txId, httpStatus, metadata } = await metadataService.processTargetUrl(targetId, targetUrl);

    logger.info(`Metadata stored on Arweave with transaction ID: ${txId}`);
    logger.info(`HTTP status for ${targetUrl}: ${httpStatus}`);

    // Return only the data needed by the oracle
    res.status(200).json({
      success: true,
      message: "Target processed successfully",
      data: {
        targetId,
        txId, // Arweave transaction ID
        httpStatus,
        metadata, // Optional, for debugging/verification
      },
    });
  } catch (error) {
    logger.error("Error in processTarget:", error);
    next(new AppError(`Failed to process target: ${error instanceof Error ? error.message : "Unknown error"}`, 500));
  }
};
