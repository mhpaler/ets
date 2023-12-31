import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Initialized,
  Upgraded,
  AccessControlsSet,
  TaggingFeeSet,
  PercentagesSet,
  TaggingRecordCreated,
  TaggingRecordUpdated,
  FundsWithdrawn,
} from "../generated/ETS/ETS";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensureRelease } from "../entities/Release";
import { updatePlatformTaggingRecordStats } from "../entities/Platform";
import { updateRelayerTaggingRecordStats } from "../entities/Relayer";
import { updateTaggerTaggingRecordStats } from "../entities/Tagger";
import { updateCreatorTaggingRecordStats } from "../entities/Creator";
import { updateOwnerTaggingRecordStats } from "../entities/Owner";
import { updateCTAGTaggingRecordStats } from "../entities/Tag";
import { ensureTaggingRecord, updateTaggingRecord } from "../entities/TaggingRecord";
import { CREATE, APPEND, REMOVE } from "../utils/constants";

export function handleInitialized(event: Initialized): void {
  let settings = ensureRelease();
  settings.ets = event.address.toHexString();
  settings.etsVersion = BigInt.fromI32(event.params.version);
  settings.etsVersionDate = event.block.timestamp;
  settings.save();
}

export function handleUpgraded(event: Upgraded): void {}

export function handleAccessControlsSet(event: AccessControlsSet): void {}

export function handleTaggingFeeSet(event: TaggingFeeSet): void {
  let settings = ensureGlobalSettings();
  settings.taggingFee = event.params.newTaggingFee;
  settings.save();
}

export function handlePercentagesSet(event: PercentagesSet): void {
  let settings = ensureGlobalSettings();
  settings.taggingFeePlatformPercentage = event.params.platformPercentage;
  settings.taggingFeeRelayerPercentage = event.params.relayerPercentage;
  settings.save();
}

export function handleTaggingRecordCreated(event: TaggingRecordCreated): void {
  let taggingRecordId = event.params.taggingRecordId;
  let newRecord = ensureTaggingRecord(taggingRecordId, event);

  updatePlatformTaggingRecordStats(newRecord.tags, event);

  updateRelayerTaggingRecordStats(Address.fromString(newRecord.relayer), newRecord.tags, [], CREATE, event);

  updateTaggerTaggingRecordStats(Address.fromString(newRecord.tagger), newRecord.tags, [], CREATE, event);

  updateCreatorTaggingRecordStats(newRecord.tags, [], CREATE, event);

  updateOwnerTaggingRecordStats(newRecord.tags, [], CREATE, event);

  updateCTAGTaggingRecordStats(newRecord.tags, [], CREATE, event);
}

export function handleTaggingRecordUpdated(event: TaggingRecordUpdated): void {
  let taggingRecordId = event.params.taggingRecordId;
  let prevRecord = ensureTaggingRecord(taggingRecordId, event);
  let newRecord = updateTaggingRecord(taggingRecordId, event);

  // TaggingRecordUpdated emits 0 for appending tags & 2 for removing tags.
  // This is mapped to APPEND or REMOVE constants. See. utils/constants.ts
  let action = BigInt.fromI32(event.params.action);

  updateRelayerTaggingRecordStats(
    Address.fromString(newRecord.relayer),
    newRecord.tags,
    prevRecord.tags,
    action,
    event,
  );

  updateTaggerTaggingRecordStats(Address.fromString(newRecord.tagger), newRecord.tags, prevRecord.tags, action, event);

  updateCreatorTaggingRecordStats(newRecord.tags, prevRecord.tags, action, event);

  updateOwnerTaggingRecordStats(newRecord.tags, prevRecord.tags, action, event);

  updateCTAGTaggingRecordStats(newRecord.tags, prevRecord.tags, action, event);
}

export function handleFundsWithdrawn(event: FundsWithdrawn): void {}
