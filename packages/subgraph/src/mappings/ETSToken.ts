import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Initialized,
  Upgraded,
  TagMaxStringLengthSet,
  TagMinStringLengthSet,
  OwnershipTermLengthSet,
  ETSCoreSet,
  AccessControlsSet,
  PremiumTagPreSet,
  PremiumFlagSet,
  ReservedFlagSet,
  TagRenewed,
  TagRecycled,
  Transfer,
} from "../generated/ETSToken/ETSToken";
import { ensureRelease } from "../entities/Release";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensureTag } from "../entities/Tag";
import { updateTagOwner } from "../entities/Tag";
import { updateOwnerTagStats } from "../entities/Owner";
import { updateRelayerTagStats } from "../entities/Relayer";
import { updateCreatorTagStats } from "../entities/Creator";
import { updatePlatformTagStats } from "../entities/Platform";

export function handleInitialized(event: Initialized): void {
  let settings = ensureRelease();
  settings.etsToken = event.address.toHexString();
  settings.etsTokenVersion = BigInt.fromI32(event.params.version);
  settings.etsTokenVersionDate = event.block.timestamp;
  settings.save();
}

export function handleUpgraded(event: Upgraded): void {}

export function handleTagMaxStringLengthSet(event: TagMaxStringLengthSet): void {
  let settings = ensureGlobalSettings();
  settings.tagMaxStringLength = event.params.maxStringLength;
  settings.save();
}

export function handleTagMinStringLengthSet(event: TagMinStringLengthSet): void {
  let settings = ensureGlobalSettings();
  settings.tagMinStringLength = event.params.minStringLength;
  settings.save();
}

export function handleOwnershipTermLengthSet(event: OwnershipTermLengthSet): void {
  let settings = ensureGlobalSettings();
  settings.ownershipTermLength = event.params.termLength;
  settings.save();
}

export function handleETSCoreSet(event: ETSCoreSet): void {}

export function handleAccessControlsSet(event: AccessControlsSet): void {}

export function handlePremiumTagPreSet(event: PremiumTagPreSet): void {}

export function handlePremiumFlagSet(event: PremiumFlagSet): void {}

export function handleReservedFlagSet(event: ReservedFlagSet): void {}

export function handleTagRenewed(event: TagRenewed): void {}

export function handleTagRecycled(event: TagRecycled): void {}

export function handleTransfer(event: Transfer): void {
  let tagEntity = ensureTag(event.params.tokenId, event);
  updateTagOwner(event.params.tokenId, event.params.to, event);
  updatePlatformTagStats(event);
  updateRelayerTagStats(Address.fromString(tagEntity.relayer), event);
  updateCreatorTagStats(Address.fromString(tagEntity.creator), event);
  updateOwnerTagStats(event);
}
