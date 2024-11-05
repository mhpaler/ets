import { Address, BigInt as GraphBigInt } from "@graphprotocol/graph-ts";
import { log } from "@graphprotocol/graph-ts";
import { updateCreatorTagStats } from "../entities/Creator";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { updateOwnerTagStats } from "../entities/Owner";
import { updatePlatformTagStats } from "../entities/Platform";
import { updateRelayerTagStats } from "../entities/Relayer";
import { ensureRelease } from "../entities/Release";
import { ensureTag } from "../entities/Tag";
import { updateTagOwner } from "../entities/Tag";
import {
  AccessControlsSet,
  ETSCoreSet,
  Initialized,
  OwnershipTermLengthSet,
  PremiumFlagSet,
  PremiumTagPreSet,
  ReservedFlagSet,
  TagMaxStringLengthSet,
  TagMinStringLengthSet,
  TagRecycled,
  TagRenewed,
  Transfer,
  Upgraded,
} from "../generated/ETSToken/ETSToken";

export function handleInitialized(event: Initialized): void {
  const settings = ensureRelease();
  settings.etsToken = event.address.toHexString();
  settings.etsTokenVersion = GraphBigInt.fromI32(event.params.version);
  settings.etsTokenVersionDate = event.block.timestamp;
  settings.save();
}

export function handleUpgraded(_event: Upgraded): void {}

export function handleTagMaxStringLengthSet(event: TagMaxStringLengthSet): void {
  const settings = ensureGlobalSettings();
  settings.tagMaxStringLength = event.params.maxStringLength;
  settings.save();
}

export function handleTagMinStringLengthSet(event: TagMinStringLengthSet): void {
  const settings = ensureGlobalSettings();
  settings.tagMinStringLength = event.params.minStringLength;
  settings.save();
}

export function handleOwnershipTermLengthSet(event: OwnershipTermLengthSet): void {
  const settings = ensureGlobalSettings();
  settings.ownershipTermLength = event.params.termLength;
  settings.save();
}

export function handleETSCoreSet(_event: ETSCoreSet): void {}

export function handleAccessControlsSet(_event: AccessControlsSet): void {}

export function handlePremiumTagPreSet(_event: PremiumTagPreSet): void {}

export function handlePremiumFlagSet(_event: PremiumFlagSet): void {}

export function handleReservedFlagSet(_event: ReservedFlagSet): void {}

export function handleTagRenewed(_event: TagRenewed): void {}

export function handleTagRecycled(_event: TagRecycled): void {}

export function handleTransfer(event: Transfer): void {
  const tagEntity = ensureTag(event.params.tokenId, event);
  updateTagOwner(event.params.tokenId, event.params.to, event);
  updatePlatformTagStats(event);
  updateRelayerTagStats(Address.fromString(tagEntity.relayer), event);
  updateCreatorTagStats(Address.fromString(tagEntity.creator), event);
  updateOwnerTagStats(event);
}
