import { ethers } from "ethers";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config";
import { createSigner } from "../services/shared/signerService";
import { metadataService } from "../services/target/metadataService";
import { AppError } from "../utils/errorHandler";
import { logger } from "../utils/logger";

/**
 * Enrich a target with metadata
 */
export const enrichTarget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chainId, targetId } = req.body;

    if (!targetId) {
      return next(new AppError("Target ID is required", 400));
    }

    logger.info(`Enriching target ${targetId} on chain ${chainId}`);

    // Get a signer for this chain
    const signer = await createSigner(chainId);

    // Get the target contract
    const targetAddress =
      config.contracts.etsTarget.address[chainId as keyof typeof config.contracts.etsTarget.address];
    const targetContract = new ethers.Contract(targetAddress, config.contracts.etsTarget.abi, signer);

    // Get the enrich target contract
    const enrichTargetAddress =
      config.contracts.etsEnrichTarget.address[chainId as keyof typeof config.contracts.etsEnrichTarget.address];
    const enrichTargetContract = new ethers.Contract(enrichTargetAddress, config.contracts.etsEnrichTarget.abi, signer);

    // Get the target information
    logger.info(`Fetching target details for ID ${targetId}`);
    const target = await targetContract.getTargetById(targetId);
    const targetUrl = target.targetURI;

    if (!targetUrl) {
      return next(new AppError("Target URL is empty or invalid", 400));
    }

    logger.info(`Processing target URL: ${targetUrl}`);

    // Process the target URL - extract metadata and upload to Arweave
    const { txId, httpStatus, metadata } = await metadataService.processTargetUrl(targetId, targetUrl);

    logger.info(`Metadata stored on Arweave with transaction ID: ${txId}`);
    logger.info(`HTTP status for ${targetUrl}: ${httpStatus}`);

    // Call the fulfillEnrichTarget function to update the on-chain data
    const tx = await enrichTargetContract.fulfillEnrichTarget(
      targetId,
      txId, // Arweave transaction ID as the IPFS hash replacement
      httpStatus,
    );

    logger.info(`Transaction submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    logger.info(`Transaction confirmed in block ${receipt.blockNumber}`);

    res.status(200).json({
      success: true,
      message: "Target enriched successfully",
      data: {
        chainId,
        targetId,
        arweaveTxId: txId,
        arweaveUrl: `${config.arweave.gateway}/${txId}`,
        httpStatus,
        transactionHash: receipt.transactionHash,
        metadata: metadata,
      },
    });
  } catch (error) {
    logger.error("Error in enrichTarget:", error);
    next(new AppError(`Failed to enrich target: ${error instanceof Error ? error.message : "Unknown error"}`, 500));
  }
};

/**
 * Handle target webhook events
 * Primarily for handling RequestEnrichTarget events
 */
export const handleTargetWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chainId, eventName, eventData } = req.body;

    logger.info(`Handling target webhook for event ${eventName} on chain ${chainId}`);

    if (eventName === "RequestEnrichTarget") {
      const targetId = eventData?.targetId;

      if (!targetId) {
        return next(new AppError("Target ID is required in event data", 400));
      }

      // Immediately acknowledge receipt of the webhook
      res.status(202).json({
        success: true,
        message: "Target webhook received and being processed",
        data: {
          event: eventName,
          chainId,
          targetId,
          status: "processing",
        },
      });

      // Process the enrichment asynchronously
      // This allows the webhook to return quickly while processing continues
      enrichTargetAsync(chainId, targetId).catch((error) => {
        logger.error(`Async enrichment failed for target ${targetId}:`, error);
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Unsupported event: ${eventName}`,
      });
    }
  } catch (error) {
    logger.error("Error in handleTargetWebhook:", error);
    next(new AppError("Failed to handle target webhook", 500));
  }
};

/**
 * Process target enrichment asynchronously
 * This is called after the webhook has already responded
 */
async function enrichTargetAsync(chainId: number, targetId: string): Promise<void> {
  try {
    logger.info(`Starting async enrichment for target ${targetId} on chain ${chainId}`);

    // Get a signer for this chain
    const signer = await createSigner(chainId);

    // Get the target contract
    const targetAddress =
      config.contracts.etsTarget.address[chainId as keyof typeof config.contracts.etsTarget.address];
    const targetContract = new ethers.Contract(targetAddress, config.contracts.etsTarget.abi, signer);

    // Get the enrich target contract
    const enrichTargetAddress =
      config.contracts.etsEnrichTarget.address[chainId as keyof typeof config.contracts.etsEnrichTarget.address];
    const enrichTargetContract = new ethers.Contract(enrichTargetAddress, config.contracts.etsEnrichTarget.abi, signer);

    // Get the target information
    logger.info(`Fetching target details for ID ${targetId}`);
    const target = await targetContract.getTargetById(targetId);
    const targetUrl = target.targetURI;

    if (!targetUrl) {
      logger.error(`Target URL is empty for target ID ${targetId}`);
      return;
    }

    logger.info(`Processing target URL: ${targetUrl}`);

    // Process the target URL - extract metadata and upload to Arweave
    const { txId, httpStatus } = await metadataService.processTargetUrl(targetId, targetUrl);

    logger.info(`Metadata stored on Arweave with transaction ID: ${txId}`);
    logger.info(`HTTP status for ${targetUrl}: ${httpStatus}`);

    // Call the fulfillEnrichTarget function to update the on-chain data
    const tx = await enrichTargetContract.fulfillEnrichTarget(
      targetId,
      txId, // Arweave transaction ID as the IPFS hash replacement
      httpStatus,
    );

    logger.info(`Transaction submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    logger.info(`Transaction confirmed in block ${receipt.blockNumber}`);

    logger.info(`Async enrichment completed for target ${targetId}`);
  } catch (error) {
    logger.error(`Error in async enrichment for target ${targetId}:`, error);
    throw error; // Re-throw to be caught by the caller
  }
}
