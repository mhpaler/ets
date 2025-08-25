import { ApplicationFailure, proxyActivities, sleep } from "@temporalio/workflow";
import type * as activities from "../activities";
import type { TagCreatedResult, TagCreatedWorkflowInput } from "../types";

// Import activity types
const { createTagCoinMetadata, deployTagCoinOnZora, allocateCreatorRewards } = proxyActivities<typeof activities>({
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
    // Step 1: Create metadata for the TAG coin
    console.log(`[Workflow] Creating metadata for TAG ${input.tagString} (ID: ${input.tagId})`);

    const metadataResult = await createTagCoinMetadata({
      tagId: input.tagId,
      tagString: input.tagString,
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
    console.log(`[Workflow] Successfully created metadata for TAG ${input.tagString}`);

    // Step 2: Deploy TAG coin on Zora
    console.log(`[Workflow] Deploying TAG coin on Zora for ${input.tagString}`);

    const zoraResult = await deployTagCoinOnZora({
      tagId: input.tagId,
      tagString: input.tagString,
      coinAddress: input.coinAddress,
      metadataURI: metadataResult.metadataURI,
      creator: input.creator,
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
    console.log(`[Workflow] Successfully deployed on Zora: ${zoraResult.coinAddress}`);

    // Wait for blockchain confirmation
    await sleep("10 seconds");

    // Step 3: Allocate creator rewards (placeholder for future implementation)
    console.log(`[Workflow] Allocating creator rewards for TAG ${input.tagString}`);

    try {
      const rewardsResult = await allocateCreatorRewards({
        tagId: input.tagId,
        coinAddress: zoraResult.coinAddress,
        creator: input.creator,
        amount: "1000000", // 1M units as initial allocation
      });

      if (rewardsResult.status === "success") {
        result.steps.allocateRewards = true;
        console.log("[Workflow] Successfully allocated creator rewards");
      } else {
        console.warn(`[Workflow] Creator rewards allocation failed: ${rewardsResult.error}`);
        // Don't fail the workflow for this - it's optional for now
      }
    } catch (rewardsError) {
      console.warn("[Workflow] Creator rewards allocation error:", rewardsError);
      // Continue without failing - rewards are optional
    }

    result.status = result.steps.deployOnZora ? "completed" : "partial";
    return result;
  } catch (error) {
    console.error(`[Workflow] TAG coin creation failed for ${input.tagString}:`, error);

    // Check if any steps succeeded for partial success
    if (result.steps.createMetadata || result.steps.deployOnZora) {
      result.status = "partial";
    }

    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}
