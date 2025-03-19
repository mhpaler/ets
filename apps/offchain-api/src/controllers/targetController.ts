import { createTargetClient } from "@ethereum-tag-service/sdk-core";
import { ethers } from "ethers";
import type { NextFunction, Request, Response } from "express";
import { metadataService } from "../services/target/metadataService";
import { AppError } from "../utils/errorHandler";
import { logger } from "../utils/logger";

/**
 * Process a target URL and return enrichment data
 * This endpoint supports both JSON and ABI-encoded bytes responses
 */
export const processTarget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chainId, targetId, returnType = "bytes" } = req.body;

    if (!targetId) {
      return next(new AppError("Target ID is required", 400));
    }

    if (returnType !== "bytes" && returnType !== "json") {
      return next(new AppError("returnType must be either 'bytes' or 'json'", 400));
    }

    logger.info(`Processing target ${targetId} on chain ${chainId} with returnType: ${returnType}`);

    // Create SDK Core client for Target contract (read-only)
    const targetClient = createTargetClient({ chainId });

    if (!targetClient) {
      return next(new AppError(`Failed to create client for chain ${chainId}`, 500));
    }

    // Get the target information from the blockchain
    logger.info(`Fetching target details for ID ${targetId}`);
    const target = await targetClient.getTargetById(targetId);
    const targetUrl = target.targetURI;

    if (!targetUrl) {
      return next(new AppError("Target URL is empty or invalid", 400));
    }

    logger.info(`Processing target URL: ${targetUrl}`);

    // Process the target URL - extract metadata and upload to Arweave
    const { txId, httpStatus, metadata } = await metadataService.processTargetUrl(targetId, targetUrl);

    if (txId) {
      logger.info(`Metadata stored on Arweave with transaction ID: ${txId}`);
    } else {
      logger.warn(`Metadata extraction failed with status ${httpStatus}. Arweave upload skipped.`);
    }

    logger.info(`HTTP status for ${targetUrl}: ${httpStatus}`);

    // Prepare the response data
    const responseData = {
      targetId,
      txId: txId || "", // Use empty string instead of null for ABI encoding
      httpStatus,
      metadata, // Including error metadata for debugging
    };

    // Return the response in the requested format
    if (returnType === "json") {
      // Return JSON response (for testing and readability)
      res.status(200).json({
        success: true,
        message: txId ? "Target processed successfully" : "Target processing failed but captured error",
        data: responseData,
      });
    } else {
      // Return ABI-encoded bytes (for Airnode)
      // Encode as (string, uint256) tuple that can be decoded in the smart contract
      const encodedData = ethers.utils.defaultAbiCoder.encode(["string", "uint256"], [txId || "", httpStatus]);

      logger.info(`Returning ABI-encoded data: ${encodedData}`);

      // Return the encoded data as the raw response
      res.status(200).json({
        success: true,
        message: "Data encoded for on-chain consumption",
        rawValue: encodedData,
      });
    }
  } catch (error) {
    logger.error("Error in processTarget:", error);
    next(new AppError(`Failed to process target: ${error instanceof Error ? error.message : "Unknown error"}`, 500));
  }
};
