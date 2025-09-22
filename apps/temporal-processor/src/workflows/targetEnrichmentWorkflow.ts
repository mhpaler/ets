import { ApplicationFailure, proxyActivities, sleep } from "@temporalio/workflow";
import type * as activities from "../activities";
import type { TargetEnrichmentResult, TargetEnrichmentWorkflowInput } from "../types";

// Import activity types with proper timeout and retry configuration
const { fetchTargetMetadata, emitTargetEnrichmentEvent } = proxyActivities<typeof activities>({
  startToCloseTimeout: "2 minutes",
  retry: {
    initialInterval: "1 second",
    backoffCoefficient: 2,
    maximumAttempts: 3,
    maximumInterval: "30 seconds",
  },
});

/**
 * Workflow for enriching targets with metadata
 *
 * This workflow handles the EnrichTargetRequested events from the blockchain.
 * It fetches metadata from the target URI and emits an enrichment event
 * for The Graph to index.
 *
 * Steps:
 * 1. Fetch metadata from the target URI
 * 2. Emit enrichment event on-chain with the metadata
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
    console.log(`[Workflow] Starting target enrichment for ${input.targetURI} (ID: ${input.targetId})`);

    // Step 1: Fetch metadata from the target URI
    console.log(`[Workflow] Fetching metadata from ${input.targetURI}`);

    const metadataResult = await fetchTargetMetadata({
      targetId: input.targetId,
      targetURI: input.targetURI || "",
    });

    if (metadataResult.status === "failed") {
      throw ApplicationFailure.create({
        message: `Failed to fetch metadata: ${metadataResult.error}`,
        nonRetryable: false,
      });
    }

    result.steps.fetchMetadata = true;
    result.metadata = metadataResult;
    console.log(`[Workflow] Successfully fetched metadata for ${input.targetURI}`);

    // Step 2: Emit enrichment event on-chain
    console.log(`[Workflow] Emitting enrichment event for target ${input.targetId}`);

    const eventResult = await emitTargetEnrichmentEvent({
      targetId: input.targetId,
      metadata: metadataResult,
    });

    if (eventResult.status === "failed") {
      // Don't fail the workflow if we can't emit the event
      // The metadata was successfully fetched, which is the main goal
      console.warn(`[Workflow] Failed to emit enrichment event: ${eventResult.error}`);
      console.warn("[Workflow] Metadata was fetched but not emitted on-chain");

      // We could potentially store this for manual retry later
      result.steps.emitEnrichmentEvent = false;
      result.error = eventResult.error;
    } else {
      result.steps.emitEnrichmentEvent = true;
      result.enrichmentTransactionHash = eventResult.transactionHash;
      console.log(`[Workflow] Successfully emitted enrichment event: ${eventResult.transactionHash}`);
    }

    // Wait for blockchain confirmation if event was emitted
    if (result.steps.emitEnrichmentEvent) {
      await sleep("5 seconds");
    }

    // Determine final status
    if (result.steps.fetchMetadata && result.steps.emitEnrichmentEvent) {
      result.status = "completed";
    } else if (result.steps.fetchMetadata) {
      result.status = "partial"; // Metadata fetched but event not emitted
    }

    return result;
  } catch (error) {
    console.error(`[Workflow] Target enrichment failed for ${input.targetURI}:`, error);

    // Check if any steps succeeded for partial success
    if (result.steps.fetchMetadata) {
      result.status = "partial";
    }

    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}
