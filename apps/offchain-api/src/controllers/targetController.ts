import { createTargetClient } from "@ethereum-tag-service/sdk-core";
import type { NextFunction, Request, Response } from "express";
import { metadataService } from "../services/target/metadataService";
import { AppError } from "../utils/errorHandler";
import { getEnvironmentLogger, logger } from "../utils/logger";

/**
 * Process a target URL and return enrichment data
 * This endpoint supports both JSON and ABI-encoded bytes responses
 */
export const processTarget = async (req: Request, res: Response, next: NextFunction) => {
  // Determine environment based on staging parameter outside try/catch for error handling
  const { chainId, targetId, returnType = "airnode", staging = false } = req.body;
  const environment = staging ? "staging" : "production";
  const envLogger = getEnvironmentLogger(environment);

  try {
    if (!targetId) {
      return next(new AppError("Target ID is required", 400));
    }

    if (returnType !== "airnode" && returnType !== "json") {
      return next(new AppError("returnType must be either 'airnode' or 'json'", 400));
    }

    envLogger.info(`Processing target ${targetId} on chain ${chainId} with returnType: ${returnType}`);

    // Create SDK Core client for Target contract (read-only) with environment parameter
    const targetClient = createTargetClient({ chainId, environment });

    if (!targetClient) {
      return next(new AppError(`Failed to create client for chain ${chainId}`, 500));
    }

    // Get the target information from the blockchain
    envLogger.info(`Fetching target details for ID ${targetId}`);
    const target = await targetClient.getTargetById(targetId);
    const targetUrl = target.targetURI;

    if (!targetUrl) {
      return next(new AppError("Target URL is empty or invalid", 400));
    }

    envLogger.info(`Processing target URL: ${targetUrl}`);

    // Process the target URL - extract metadata and upload to Arweave
    const { txId, httpStatus, metadata } = await metadataService.processTargetUrl(targetId, targetUrl);

    if (txId) {
      envLogger.info(`Metadata stored on Arweave with transaction ID: ${txId}`);
    } else {
      envLogger.warn(`Metadata extraction failed with status ${httpStatus}. Arweave upload skipped.`);
    }

    envLogger.info(`HTTP status for ${targetUrl}: ${httpStatus}`);

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
      // return in format expected by Airnode
      res.status(200).json({
        success: true,
        txId: txId || "",
        httpStatus: httpStatus.toString(),
      });
    }
  } catch (error) {
    envLogger.error("Error in processTarget:", error);
    next(new AppError(`Failed to process target: ${error instanceof Error ? error.message : "Unknown error"}`, 500));
  }
};
