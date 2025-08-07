import { createAccessControlsClient } from "@ethereum-tag-service/sdk-core";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config";
import { tagService } from "../services/auction/tagService";
import { AppError } from "../utils/errorHandler";
import { getEnvironmentLogger, logger } from "../utils/logger";

/**
 * Get the next tag to be auctioned
 */
export const getNextAuction = async (req: Request, res: Response, next: NextFunction) => {
  // Determine environment based on staging parameter outside try/catch for error handling
  const { chainId, returnType = "airnode", staging = false } = req.body;
  const environment = staging ? "staging" : "production";
  const envLogger = getEnvironmentLogger(environment);

  try {
    if (!chainId) {
      return next(new AppError("Chain ID is required", 400));
    }

    envLogger.info(`Getting next CTAG for auction on chain ${chainId}`);

    // Validate chainId is supported
    if (!config.chains.isChainSupported(chainId)) {
      return next(new AppError(`Chain ID ${chainId} is not supported`, 400));
    }

    // Log contract address information for both environments
    try {
      // Create clients for both environments to log addresses
      const prodClient = createAccessControlsClient({
        chainId,
        environment: "production",
      });

      const stagingClient = createAccessControlsClient({
        chainId,
        environment: "staging",
      });

      // Get contract addresses from clients
      const prodAddress = prodClient ? await prodClient.getAddress() : "N/A";
      const stagingAddress = stagingClient ? await stagingClient.getAddress() : "N/A";

      envLogger.info(`AccessControls contract addresses for chain ${chainId}:`, {
        production: prodAddress,
        staging: stagingAddress,
        requestedEnvironment: environment,
      });
    } catch (error) {
      envLogger.warn("Failed to log contract addresses:", error);
    }

    // Create an AccessControls client using the sdk-core with environment parameter
    const accessControlsClient = createAccessControlsClient({
      chainId,
      environment,
    });

    if (!accessControlsClient) {
      return next(new AppError(`Failed to create AccessControls client for chain ${chainId} (${environment})`, 500));
    }

    // Get the platform address using the client
    let platformAddress = await accessControlsClient.getPlatformAddress();
    envLogger.info(`Platform address for chain ${chainId}: "${platformAddress}"`);

    // Additional debug for platform address
    envLogger.info(
      `Platform address type: ${typeof platformAddress}, length: ${platformAddress?.length}, empty check: ${!platformAddress}`,
    );

    // Validate platform address - this is critical for the query
    if (!platformAddress) {
      envLogger.warn(`No platform address found for chain ${chainId} in ${environment} environment`);
      return next(new AppError(`Platform address not found for chain ${chainId} in ${environment} environment`, 500));
    }

    // Ensure platform address is properly formatted
    if (typeof platformAddress === "string") {
      // Normalize to lowercase
      platformAddress = platformAddress.toLowerCase();

      // Check for 0x prefix
      if (!platformAddress.startsWith("0x")) {
        platformAddress = `0x${platformAddress}`;
        envLogger.info(`Fixed platform address format: "${platformAddress}"`);
      }

      // Validate address length (should be 42 characters for standard Ethereum address)
      if (platformAddress.length !== 42) {
        envLogger.warn(`Platform address has unusual length: ${platformAddress.length} chars`);
      }
    } else {
      envLogger.error(`Platform address is not a string: ${typeof platformAddress}`);
      return next(new AppError(`Invalid platform address format for chain ${chainId}`, 500));
    }

    // Find the next tag to auction using the TagService
    const nextTag = await tagService.findNextCTAG(platformAddress, chainId, environment);

    // Prepare the response data
    const hasEligibleTag = !!nextTag;
    const tagId = nextTag?.tagId || "";
    const tagDisplay = nextTag?.tagDisplay || "";

    if (returnType === "json") {
      // Return JSON response (for testing and readability)
      return res.status(200).json({
        success: true,
        message: hasEligibleTag ? "Found next tag for auction" : "No eligible tags found for auction",
        data: {
          chainId,
          hasEligibleTag,
          ...(hasEligibleTag && { tagId, tagDisplay }),
        },
      });
    }

    // Return in format expected by Airnode
    return res.status(200).json({
      success: true,
      hasEligibleTag: hasEligibleTag.toString(), // Convert boolean to string
      tagId: tagId,
      tagDisplay: tagDisplay,
    });
  } catch (error) {
    envLogger.error("Error in getNextAuction:", error);
    next(
      new AppError(`Failed to get next auction tag: ${error instanceof Error ? error.message : "Unknown error"}`, 500),
    );
  }
};
/**
 * Handle auction event webhooks
 * Primarily for handling RequestCreateAuction events
 */
export const handleAuctionWebhook = async (req: Request, res: Response, next: NextFunction) => {
  // Determine environment based on staging parameter outside try/catch for error handling
  const { chainId, eventName, staging = false } = req.body;
  const environment = staging ? "staging" : "production";
  const envLogger = getEnvironmentLogger(environment);

  try {
    envLogger.info(`Handling auction webhook for event ${eventName} on chain ${chainId}`);

    if (eventName === "RequestCreateAuction") {
      // TODO: Implement logic from BlockchainService.handleRequestCreateAuctionEvent
      // 1. Check if there's an open slot for auction
      // 2. Get the next CTAG (could reuse getNextAuction logic)
      // 3. Send the transaction to fulfill the request

      // Immediately acknowledge receipt of the webhook
      res.status(202).json({
        success: true,
        message: "Auction webhook received and being processed",
        data: {
          event: eventName,
          chainId,
          status: "processing",
        },
      });

      // Processing would continue asynchronously after response
    } else {
      res.status(400).json({
        success: false,
        message: `Unsupported event: ${eventName}`,
      });
    }
  } catch (error) {
    envLogger.error("Error in handleAuctionWebhook:", error);
    next(new AppError("Failed to handle auction webhook", 500));
  }
};
