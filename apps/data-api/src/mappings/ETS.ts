import { Address, BigInt as GraphBigInt } from "@graphprotocol/graph-ts";
import { updateCreatorTaggingRecordStats } from "../entities/Creator";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { updateOwnerTaggingRecordStats } from "../entities/Owner";
import { updatePlatformTaggingRecordStats } from "../entities/Platform";
import { updateRelayerTaggingRecordStats } from "../entities/Relayer";
import { ensureRelease } from "../entities/Release";
import { updateCTAGTaggingRecordStats } from "../entities/Tag";
import { updateTaggerTaggingRecordStats } from "../entities/Tagger";
import { ensureTaggingRecord, updateTaggingRecord } from "../entities/TaggingRecord";
import type {
  AccessControlsSet,
  FundsWithdrawn,
  Initialized,
  PercentagesSet,
  TaggingFeeSet,
  TaggingRecordCreated,
  TaggingRecordUpdated,
  Upgraded,
} from "../generated/ETS/ETS";
import { APPEND, CREATE, REMOVE } from "../utils/constants";

export function handleInitialized(event: Initialized): void {
  const settings = ensureRelease();
  settings.ets = event.address.toHexString();
  settings.etsVersion = GraphBigInt.fromI32(event.params.version);
  settings.etsVersionDate = event.block.timestamp;
  settings.save();
}

export function handleUpgraded(_event: Upgraded): void {}

export function handleAccessControlsSet(_event: AccessControlsSet): void {}

export function handleTaggingFeeSet(event: TaggingFeeSet): void {
  const settings = ensureGlobalSettings();
  settings.taggingFee = event.params.newTaggingFee;
  settings.save();
}

export function handlePercentagesSet(event: PercentagesSet): void {
  const settings = ensureGlobalSettings();
  settings.taggingFeePlatformPercentage = event.params.platformPercentage;
  settings.taggingFeeRelayerPercentage = event.params.relayerPercentage;
  settings.save();
}

export function handleTaggingRecordCreated(event: TaggingRecordCreated): void {
  const taggingRecordId = event.params.taggingRecordId;
  const newRecord = ensureTaggingRecord(taggingRecordId, event);

  updatePlatformTaggingRecordStats(newRecord.tags, event);

  updateRelayerTaggingRecordStats(Address.fromString(newRecord.relayer), newRecord.tags, [], CREATE, event);

  updateTaggerTaggingRecordStats(Address.fromString(newRecord.tagger), newRecord.tags, [], CREATE, event);

  updateCreatorTaggingRecordStats(newRecord.tags, [], CREATE, event);

  updateOwnerTaggingRecordStats(newRecord.tags, [], CREATE, event);

  updateCTAGTaggingRecordStats(newRecord.tags, [], CREATE, event);
}

export function handleTaggingRecordUpdated(event: TaggingRecordUpdated): void {
  const taggingRecordId = event.params.taggingRecordId;
  const prevRecord = ensureTaggingRecord(taggingRecordId, event);
  const newRecord = updateTaggingRecord(taggingRecordId, event);

  // TaggingRecordUpdated emits 0 for appending tags & 2 for removing tags.
  // This is mapped to APPEND or REMOVE constants. See. utils/constants.ts
  const action = GraphBigInt.fromI32(event.params.action);

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

export function handleFundsWithdrawn(_event: FundsWithdrawn): void {}
