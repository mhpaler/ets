import { DataSourceContext, DataSourceTemplate, BigInt as GraphBigInt, log } from "@graphprotocol/graph-ts";
import { ensureRelease } from "../entities/Release";
import { ensureTarget, updateTarget } from "../entities/Target";
import {
  AccessControlsSet,
  EnrichTargetSet,
  Initialized,
  TargetCreated,
  TargetUpdated,
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

export function handleEnrichTargetSet(_event: EnrichTargetSet): void {}

export function handleTargetUpdated(_event: TargetUpdated): void {
  const targetId = _event.params.targetId;
  const target = updateTarget(targetId, _event);
  // If the target has an Arweave TX ID, create a file data source
  if (target.arweaveTxId && target.arweaveTxId.length > 0) {
    // Set currentMetadata right here, when we know the target and arweaveTxId are valid
    target.currentMetadata = target.arweaveTxId;
    target.save();
    log.info("Updated Target.currentMetadata to: {}", [target.arweaveTxId]);

    // Then create the file data source.
    // Create context with target ID
    const context = new DataSourceContext();
    context.setString("targetId", targetId.toString());
    context.setBigInt("timestamp", _event.block.timestamp);

    // Create with context
    DataSourceTemplate.createWithContext("TargetMetadata", [target.arweaveTxId], context);
  }
}

export function handleTargetCreated(event: TargetCreated): void {
  ensureTarget(event.params.targetId, event);
}
