import { BigInt as GraphBigInt, log } from "@graphprotocol/graph-ts";
import { parseEnrichmentPayload, updateTargetWithMetadata } from "../entities/Metadata";
import { ensureRelease } from "../entities/Release";
import { ensureTarget, updateTarget } from "../entities/Target";
import {
  AccessControlsSet,
  Initialized,
  TargetCreated,
  TargetEnriched,
  Upgraded,
} from "../generated/ETSTarget/ETSTarget";

export function handleInitialized(event: Initialized): void {
  const settings = ensureRelease();
  settings.etsTarget = event.address.toHexString();
  settings.etsTargetVersion = GraphBigInt.fromI32(event.params.version);
  settings.etsTargetVersionDate = event.block.timestamp;
  settings.save();
}

export function handleUpgraded(_event: Upgraded): void {}

export function handleAccessControlsSet(_event: AccessControlsSet): void {}

export function handleTargetEnriched(event: TargetEnriched): void {
  const targetId = event.params.targetId;
  const target = updateTarget(targetId, event);

  log.info("TargetEnriched event received for targetId: {}", [targetId.toString()]);

  // Parse the enrichment payload (UTF-8 JSON bytes)
  const metadata = parseEnrichmentPayload(event.params.payload);

  if (metadata) {
    // Update target with parsed metadata
    updateTargetWithMetadata(
      target,
      metadata,
      event.params.enrichedBy.toHexString(),
      event.params.schemaVersion,
      event.params.payloadHash.toHexString(),
      event.block.timestamp,
    );

    log.info("Successfully enriched target {} with metadata", [targetId.toString()]);
  } else {
    log.error("Failed to parse enrichment payload for target {}", [targetId.toString()]);
  }
}

export function handleTargetCreated(event: TargetCreated): void {
  ensureTarget(event.params.targetId, event);
}
