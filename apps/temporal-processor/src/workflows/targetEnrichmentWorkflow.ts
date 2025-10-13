import { ApplicationFailure, log, proxyActivities, sleep } from "@temporalio/workflow";
import type * as activities from "../activities/index.js";
import type { TargetEnrichmentResult, TargetEnrichmentWorkflowInput } from "../types/index.js";

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

    // Note: We always proceed even if extraction failed (error metadata)
    // The Graph needs to index all enrichment attempts, including failures
    const isSuccess =
      metadata.core.extractionMethod !== "error" && (!metadata.core.httpStatus || metadata.core.httpStatus < 400);

    // Convert ETSTargetMetadata to MetadataFetchResult for compatibility
    result.metadata = {
      title: metadata.core.title,
      description: metadata.core.description,
      image: metadata.core.image || undefined,
      keywords: metadata.keywords,
      targetType: metadata.type,
      status: isSuccess ? ("success" as const) : ("failed" as const),
    };

    if (isSuccess) {
      log.info(`Successfully fetched metadata for ${input.targetURI}`);
    } else {
      log.warn(`Metadata extraction failed for ${input.targetURI}: ${metadata.core.title}`);
    }

    // Step 2: Call enrichTarget function on-chain
    log.info(`Calling enrichTarget on-chain for target ${input.targetId}`);

    const eventResult = await callEnrichTargetOnChain({
      targetId: input.targetId,
      metadata: metadata,
    });

    if (eventResult.status === "failed") {
      // Fail the workflow so Temporal can retry according to retry policy
      // The on-chain enrichment is critical - metadata-only is not acceptable
      log.error(`Failed to call enrichTarget on-chain: ${eventResult.error}`);
      throw ApplicationFailure.create({
        message: `On-chain enrichment failed: ${eventResult.error}`,
        type: "EnrichmentTransactionFailed",
        nonRetryable: false, // Allow Temporal to retry
      });
    }

    result.steps.emitEnrichmentEvent = true;
    result.enrichmentTransactionHash = eventResult.transactionHash;
    log.info(`Successfully called enrichTarget on-chain: ${eventResult.transactionHash}`);

    // Optional: Add delay for indexers to process the event
    // Note: Transaction receipt is already awaited in the activity, so this is usually unnecessary
    // Uncomment if you need to ensure indexers have time to process before workflow completes
    // if (result.steps.emitEnrichmentEvent) {
    //   await sleep("5 seconds");
    // }

    // If we reach here, both steps succeeded
    result.status = "completed";
    return result;
  } catch (error) {
    log.error(`Target enrichment failed for ${input.targetURI}:`, { error });
    result.error = error instanceof Error ? error.message : String(error);

    // Re-throw to let Temporal handle the failure
    throw error;
  }
}
