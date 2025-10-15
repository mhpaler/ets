import { BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { ensureChannel } from "../entities/Channel";
import { ensureTag } from "../entities/Tag";
import { ensureTagger } from "../entities/Tagger";
import { ensureTarget } from "../entities/Target";
import { ETS } from "../generated/ETS/ETS";
import { TaggingRecord } from "../generated/schema";
import { logCritical } from "../utils/logCritical";

export function ensureTaggingRecord(taggingRecordId: GraphBigInt, event: ethereum.Event): TaggingRecord {
  let taggingRecord = TaggingRecord.load(taggingRecordId.toString());

  if (taggingRecord === null && event) {
    const contract = ETS.bind(event.address);
    const taggingRecordCall = contract.try_getTaggingRecordFromId(taggingRecordId);

    if (taggingRecordCall.reverted) {
      logCritical("getTaggingRecordFromId reverted for {}", [taggingRecordId.toString()]);
    }

    // value0 contains tag coin addresses
    const _tagAddresses = taggingRecordCall.value.value0;
    const tagIDs: string[] = [];

    // Note: In TAG Coins model, we need to map coin addresses to tag composite IDs
    // For now, we'll skip the tag mapping since we need to look up tags by coin address
    // This needs to be fixed to properly map coin addresses to tag composite IDs

    taggingRecord = new TaggingRecord(taggingRecordId.toString());
    taggingRecord.txnHash = event.transaction.hash.toHexString();
    taggingRecord.tags = tagIDs; // Will need to populate this properly
    taggingRecord.target = ensureTarget(taggingRecordCall.value.value1, event).id; // value1 is targetId
    taggingRecord.recordType = taggingRecordCall.value.value2; // value2 is recordType
    taggingRecord.tagger = ensureTagger(taggingRecordCall.value.value3, event).id; // value3 is tagger
    taggingRecord.channel = ensureChannel(taggingRecordCall.value.value4, event).id; // value4 is channel
    taggingRecord.timestamp = event.block.timestamp;
    taggingRecord.save();
  }
  return taggingRecord as TaggingRecord;
}

export function updateTaggingRecord(taggingRecordId: GraphBigInt, event: ethereum.Event): TaggingRecord {
  const taggingRecord = ensureTaggingRecord(taggingRecordId, event);

  if (taggingRecord && event) {
    const contract = ETS.bind(event.address);
    const taggingRecordCall = contract.try_getTaggingRecordFromId(taggingRecordId);

    if (taggingRecordCall.reverted) {
      logCritical("getTaggingRecordFromId reverted for {}", [taggingRecordId.toString()]);
    }

    // value0 contains tag coin addresses
    const _tagAddresses = taggingRecordCall.value.value0;
    const tagIDs: string[] = [];

    // Note: In TAG Coins model, we need to map coin addresses to tag composite IDs
    // For now, we'll skip the tag mapping since we need to look up tags by coin address
    // This needs to be fixed to properly map coin addresses to tag composite IDs

    taggingRecord.tags = tagIDs; // Will need to populate this properly
    taggingRecord.save();
  }
  return taggingRecord as TaggingRecord;
}
