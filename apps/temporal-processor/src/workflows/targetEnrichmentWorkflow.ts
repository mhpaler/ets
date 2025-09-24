import { ApplicationFailure, log, proxyActivities, sleep } from "@temporalio/workflow";
import type * as activities from "../activities";
import type { TargetEnrichmentResult, TargetEnrichmentWorkflowInput } from "../types";

// Import activity types with proper timeout and retry configuration
const { fetchTargetMetadata, callEnrichTargetOnChain } = proxyActivities<typeof activities>({
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
 * It fetches metadata from the target URI and calls the enrichTarget function
 * on-chain, which emits an event for The Graph to index.
 *
 * Steps:
 * 1. Fetch metadata from the target URI
 * 2. Call enrichTarget on-chain with the metadata
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
    log.info(`Starting target enrichment for ${input.targetURI} (ID: ${input.targetId})`);

    // Step 1: Fetch metadata from the target URI
    log.info(`Fetching metadata from ${input.targetURI}`);

    const metadata = await fetchTargetMetadata({
      targetId: input.targetId,
      targetURI: input.targetURI || "",
    });

    result.steps.fetchMetadata = true;
    // Convert ETSTargetMetadata to MetadataFetchResult for compatibility
    result.metadata = {
      title: metadata.core.title,
      description: metadata.core.description,
      image: metadata.core.image || undefined,
      keywords: metadata.keywords,
      targetType: metadata.type,
      status: "success" as const,
    };
    log.info(`Successfully fetched metadata for ${input.targetURI}`);

    // Step 2: Call enrichTarget function on-chain
    log.info(`Calling enrichTarget on-chain for target ${input.targetId}`);

    const eventResult = await callEnrichTargetOnChain({
      targetId: input.targetId,
      metadata: metadata,
    });

    if (eventResult.status === "failed") {
      // Don't fail the workflow if we can't call the contract function
      // The metadata was successfully fetched, which is the main goal
      log.warn(`Failed to call enrichTarget on-chain: ${eventResult.error}`);
      log.warn("Metadata was fetched but not recorded on-chain");

      // We could potentially store this for manual retry later
      result.steps.emitEnrichmentEvent = false;
      result.error = eventResult.error;
    } else {
      result.steps.emitEnrichmentEvent = true;
      result.enrichmentTransactionHash = eventResult.transactionHash;
      log.info(`Successfully called enrichTarget on-chain: ${eventResult.transactionHash}`);
    }

    // Optional: Add delay for indexers to process the event
    // Note: Transaction receipt is already awaited in the activity, so this is usually unnecessary
    // Uncomment if you need to ensure indexers have time to process before workflow completes
    // if (result.steps.emitEnrichmentEvent) {
    //   await sleep("5 seconds");
    // }

    // Determine final status
    if (result.steps.fetchMetadata && result.steps.emitEnrichmentEvent) {
      result.status = "completed";
    } else if (result.steps.fetchMetadata) {
      result.status = "partial"; // Metadata fetched but not recorded on-chain
    }

    return result;
  } catch (error) {
    log.error(`Target enrichment failed for ${input.targetURI}:`, { error });

    // Check if any steps succeeded for partial success
    if (result.steps.fetchMetadata) {
      result.status = "partial";
    }

    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}
