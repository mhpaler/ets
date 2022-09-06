import { BigInt } from "@graphprotocol/graph-ts";
import { ensureTarget } from "../entities/Target";
import {
  Initialized,
  Upgraded,
  AccessControlsSet,
  EnrichTargetSet,
  TargetCreated,
  TargetUpdated,
} from "../generated/ETSTarget/ETSTarget";
import { ensureRelease } from "../entities/Release";

export function handleInitialized(event: Initialized): void {
  let settings = ensureRelease();
  settings.etsTarget = event.address.toHexString();
  settings.etsTargetVersion = BigInt.fromI32(event.params.version);
  settings.etsTargetVersionDate = event.block.timestamp;
  settings.save();
}

export function handleUpgraded(event: Upgraded): void {}

export function handleAccessControlsSet(event: AccessControlsSet): void {}

export function handleEnrichTargetSet(event: EnrichTargetSet): void {}

export function handleTargetUpdated(event: TargetUpdated): void {}

export function handleTargetCreated(event: TargetCreated): void {
  ensureTarget(event.params.targetId, event);
}
