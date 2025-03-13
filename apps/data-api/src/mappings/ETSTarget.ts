import { BigInt as GraphBigInt } from "@graphprotocol/graph-ts";
import { ensureRelease } from "../entities/Release";
import { ensureTarget } from "../entities/Target";
import type {
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

export function handleTargetUpdated(_event: TargetUpdated): void {}

export function handleTargetCreated(event: TargetCreated): void {
  ensureTarget(event.params.targetId, event);
}
