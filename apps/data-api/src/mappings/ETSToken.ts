import { Address, BigInt as GraphBigInt } from "@graphprotocol/graph-ts";
import { updateChannelTagStats } from "../entities/Channel";
import { updateCreatorTagStats } from "../entities/Creator";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensureRelease } from "../entities/Release";
import { createTag } from "../entities/Tag";
import {
  AccessControlsSet,
  ETSCoreSet,
  Initialized,
  TagCreated,
  TagMaxStringLengthSet,
  TagMinStringLengthSet,
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

export function handleETSCoreSet(_event: ETSCoreSet): void {}

export function handleAccessControlsSet(_event: AccessControlsSet): void {}

export function handleTagCreated(event: TagCreated): void {
  // Create the tag with composite ID
  createTag(
    event.params.tagId,
    event.params.coinAddress,
    event.params.originalInput,
    event.params.displayVersion,
    event.params.machineName,
    event.params.creator,
    event.params.channel,
    event.block.timestamp,
    event,
  );

  // Update channel stats
  updateChannelTagStats(event.params.channel, event);

  // Update creator stats
  updateCreatorTagStats(event.params.creator, event);
}
