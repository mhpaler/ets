import { ApplicationFailure, log, proxyActivities, sleep } from "@temporalio/workflow";
import type * as activities from "../activities";
import type { TagCreatedResult, TagCreatedWorkflowInput } from "../types";

// Import activity types
const { createTagCoinMetadata, deployTagCoinOnZora, allocateCreatorRewards, fetchPoolConfig } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: "5 minutes",
  retry: {
    initialInterval: "1 second",
    backoffCoefficient: 2,
    maximumAttempts: 5,
    maximumInterval: "1 minute",
  },
});

/**
 * Workflow for creating TAG coins on Zora
 *
 * Steps:
 * 1. Create metadata for the TAG coin
 * 2. Deploy the coin on Zora with metadata
 * 3. Allocate creator rewards (future implementation)
 */
export async function TagCreatedWorkflow(input: TagCreatedWorkflowInput): Promise<TagCreatedResult> {
  const result: TagCreatedResult = {
    tagId: input.tagId,
    status: "failed",
    steps: {
      createMetadata: false,
      deployOnZora: false,
      allocateRewards: false,
    },
  };

  try {
    // Step 1: Create metadata for the TAG coin (now a pass-through)
    log.info(`Processing TAG #${input.tagId}: ${input.originalInput} with coin address ${input.coinAddress}`);

    const metadataResult = await createTagCoinMetadata({
      tagId: input.coinAddress,
      tagString: input.originalInput,
      creator: input.creator,
      coinAddress: input.coinAddress,
    });

    if (metadataResult.status === "failed") {
      throw ApplicationFailure.create({
        message: `Failed to create metadata: ${metadataResult.error}`,
        nonRetryable: false,
      });
    }

    result.steps.createMetadata = true;
    log.info(`Metadata step complete for TAG ${input.originalInput}`);

    // Step 1.5: Fetch pool configuration from Zora API
    log.info(`Fetching pool configuration for chain ${input.chainId}`);
    const poolConfig = await fetchPoolConfig(input.chainId);
    log.info("Pool configuration fetched successfully");

    // Step 2: Deploy TAG coin on Zora
    log.info(`Deploying TAG coin on Zora for ${input.originalInput}`);

    const zoraResult = await deployTagCoinOnZora({
      tagId: input.coinAddress,
      tagString: input.originalInput,
      coinAddress: input.coinAddress,
      metadataURI: metadataResult.metadataURI,
      creator: input.creator,
      displayVersion: input.displayVersion,
      machineName: input.machineName,
      channel: input.channel,
      timestamp: input.timestamp,
      blockNumber: input.blockNumber,
      transactionHash: input.transactionHash,
      poolConfig,
    });

    if (zoraResult.status === "failed") {
      throw ApplicationFailure.create({
        message: `Failed to deploy on Zora: ${zoraResult.error}`,
        nonRetryable: false,
      });
    }

    result.steps.deployOnZora = true;
    result.coinAddress = zoraResult.coinAddress;
    result.zoraTxHash = zoraResult.transactionHash;
    log.info(`Successfully deployed on Zora: ${zoraResult.coinAddress}`);

    // Wait for blockchain confirmation
    await sleep("10 seconds");

    // Step 3: Allocate creator rewards (placeholder for future implementation)
    log.info(`Allocating creator rewards for TAG ${input.originalInput}`);

    try {
      const rewardsResult = await allocateCreatorRewards({
        tagId: input.coinAddress,
        coinAddress: zoraResult.coinAddress,
        creator: input.creator,
        amount: "1000000", // 1M units as initial allocation
      });

      if (rewardsResult.status === "success") {
        result.steps.allocateRewards = true;
        log.info("Successfully allocated creator rewards");
      } else {
        log.warn(`Creator rewards allocation failed: ${rewardsResult.error}`);
        // Don't fail the workflow for this - it's optional for now
      }
    } catch (rewardsError) {
      log.warn("Creator rewards allocation error:", { error: rewardsError });
      // Continue without failing - rewards are optional
    }

    result.status = result.steps.deployOnZora ? "completed" : "partial";
    return result;
  } catch (error) {
    log.error(`TAG coin creation failed for ${input.originalInput}:`, { error });

    // For critical failures (metadata creation or deployment), re-throw to fail the workflow
    // This ensures the workflow shows as FAILED in Temporal UI and can be retried
    if (!result.steps.deployOnZora) {
      // Deployment is critical - if it failed, the workflow should fail
      throw ApplicationFailure.create({
        message: `TAG coin workflow failed: ${error instanceof Error ? error.message : String(error)}`,
        nonRetryable: false, // Allow retry attempts
        cause: error instanceof Error ? error : undefined,
      });
    }

    // If we got here, deployment succeeded but rewards failed (non-critical)
    result.status = "partial";
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}
