import { ApplicationFailure, proxyActivities, sleep } from "@temporalio/workflow";
import type * as activities from "../activities";
import type { TargetEnrichmentResult, TargetEnrichmentWorkflowInput } from "../types";

// Import activity types
const { fetchTargetMetadata, uploadToArweave, updateTargetOnChain } = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 minutes",
  retry: {
    initialInterval: "1 second",
    backoffCoefficient: 2,
    maximumAttempts: 5,
    maximumInterval: "1 minute",
  },
});

/**
 * Workflow for enriching targets with metadata
 *
 * Steps:
 * 1. Fetch metadata from the target URI
 * 2. Upload metadata to Arweave for permanent storage
 * 3. Update the on-chain target with the Arweave transaction ID
 */
export async function TargetEnrichmentWorkflow(input: TargetEnrichmentWorkflowInput): Promise<TargetEnrichmentResult> {
  const result: TargetEnrichmentResult = {
    targetId: input.targetId,
    status: "failed",
    steps: {
      fetchMetadata: false,
      uploadToArweave: false,
      updateBlockchain: false,
    },
  };

  try {
    // Step 1: Fetch metadata from the target URI
    console.log(`[Workflow] Fetching metadata for target ${input.targetId} from ${input.targetURI}`);

    const metadataResult = await fetchTargetMetadata({
      targetId: input.targetId,
      targetURI: input.targetURI,
    });

    if (metadataResult.status === "failed") {
      throw ApplicationFailure.create({
        message: `Failed to fetch metadata: ${metadataResult.error}`,
        nonRetryable: false,
      });
    }

    result.steps.fetchMetadata = true;
    console.log(`[Workflow] Successfully fetched metadata for target ${input.targetId}`);

    // Step 2: Upload metadata to Arweave
    console.log(`[Workflow] Uploading metadata to Arweave for target ${input.targetId}`);

    const arweaveResult = await uploadToArweave({
      targetId: input.targetId,
      metadata: metadataResult,
      targetURI: input.targetURI,
    });

    if (arweaveResult.status === "failed") {
      throw ApplicationFailure.create({
        message: `Failed to upload to Arweave: ${arweaveResult.error}`,
        nonRetryable: false,
      });
    }

    result.steps.uploadToArweave = true;
    result.arweaveTransactionId = arweaveResult.transactionId;
    result.metadataURI = arweaveResult.gatewayUrl;
    console.log(`[Workflow] Successfully uploaded to Arweave: ${arweaveResult.transactionId}`);

    // Optional delay to ensure Arweave propagation
    await sleep("5 seconds");

    // Step 3: Update on-chain target with enriched metadata
    console.log(`[Workflow] Updating on-chain target ${input.targetId} with Arweave TX`);

    const updateResult = await updateTargetOnChain({
      targetId: input.targetId,
      arweaveTransactionId: arweaveResult.transactionId,
      metadataURI: arweaveResult.gatewayUrl,
    });

    if (updateResult.status === "failed") {
      // This is less critical - we have the data on Arweave
      console.warn(`[Workflow] Failed to update on-chain: ${updateResult.error}`);
      result.status = "partial";
      result.error = `On-chain update failed: ${updateResult.error}`;
    } else {
      result.steps.updateBlockchain = true;
      result.updateTransactionHash = updateResult.transactionHash;
      result.status = "completed";
      console.log(`[Workflow] Successfully updated on-chain: ${updateResult.transactionHash}`);
    }

    return result;
  } catch (error) {
    console.error(`[Workflow] Target enrichment failed for ${input.targetId}:`, error);

    // Check if any steps succeeded for partial success
    if (result.steps.fetchMetadata || result.steps.uploadToArweave) {
      result.status = "partial";
    }

    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}
