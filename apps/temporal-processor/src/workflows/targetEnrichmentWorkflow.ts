import { ApplicationFailure, proxyActivities, sleep } from "@temporalio/workflow";
import type * as activities from "../activities";
import type { TargetEnrichmentResult, TargetEnrichmentWorkflowInput } from "../types";

// Import activity types
const { fetchTargetMetadata, emitTargetEnrichmentEvent } = proxyActivities<typeof activities>({
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
 * 2. Emit enrichment event on-chain for The Graph to index
 */
export async function TargetEnrichmentWorkflow(input: TargetEnrichmentWorkflowInput): Promise<TargetEnrichmentResult> {
  const result: TargetEnrichmentResult = {
    targetId: input.targetId,
    status: "failed",
    steps: {
      fetchMetadata: false,
      emitEnrichmentEvent: false,
    },
  };

  try {
    // Ensure we have a targetURI
    if (!input.targetURI) {
      throw ApplicationFailure.create({
        message: "targetURI is required for enrichment",
        nonRetryable: true,
      });
    }

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
    result.metadata = metadataResult;
    console.log(`[Workflow] Successfully fetched metadata for target ${input.targetId}`);

    // Step 2: Emit enrichment event on-chain
    console.log(`[Workflow] Emitting enrichment event for target ${input.targetId}`);

    const enrichmentResult = await emitTargetEnrichmentEvent({
      targetId: input.targetId,
      metadata: metadataResult,
    });

    if (enrichmentResult.status === "failed") {
      throw ApplicationFailure.create({
        message: `Failed to emit enrichment event: ${enrichmentResult.error}`,
        nonRetryable: false,
      });
    }

    result.steps.emitEnrichmentEvent = true;
    result.enrichmentTransactionHash = enrichmentResult.transactionHash;
    result.status = "completed";
    console.log(`[Workflow] Successfully emitted enrichment event: ${enrichmentResult.transactionHash}`);

    return result;
  } catch (error) {
    console.error(`[Workflow] Target enrichment failed for ${input.targetId}:`, error);

    // Check if metadata was fetched for partial success
    if (result.steps.fetchMetadata) {
      result.status = "partial";
    }

    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}
