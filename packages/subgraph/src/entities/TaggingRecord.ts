import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { TaggingRecord } from "../generated/schema";
import { ETS } from "../generated/ETS/ETS";
import { ensureRelayer } from "../entities/Relayer";
import { ensureTagger } from "../entities/Tagger";
import { ensureTag } from "../entities/Tag";
import { ensureTarget } from "../entities/Target";
import { logCritical } from "../utils/logCritical";

export function ensureTaggingRecord(taggingRecordId: BigInt, event: ethereum.Event): TaggingRecord {
  let taggingRecord = TaggingRecord.load(taggingRecordId.toString());

  if (taggingRecord === null && event) {
    let contract = ETS.bind(event.address);
    let taggingRecordCall = contract.try_getTaggingRecordFromId(taggingRecordId);

    if (taggingRecordCall.reverted) {
      logCritical("getTaggingRecordFromId reverted for {}", [taggingRecordId.toString()]);
    }

    let tags: BigInt[] = taggingRecordCall.value.getTagIds();
    let tagIDs: string[] = [];
    if (tags.length > 0) {
      for (let i = 0; i < tags.length; i++) {
        let ctag = ensureTag(tags[i], event);
        tagIDs.push(ctag.id.toString());
      }
    }

    taggingRecord = new TaggingRecord(taggingRecordId.toString());
    taggingRecord.tags = tagIDs;
    taggingRecord.target = ensureTarget(taggingRecordCall.value.getTargetId(), event).id;
    taggingRecord.recordType = taggingRecordCall.value.getRecordType();
    taggingRecord.tagger = ensureTagger(taggingRecordCall.value.getTagger(), event).id;
    taggingRecord.relayer = ensureRelayer(taggingRecordCall.value.getRelayer(), event).id;
    taggingRecord.timestamp = event.block.timestamp;
    taggingRecord.save();
  }
  return taggingRecord as TaggingRecord;
}

export function updateTaggingRecord(taggingRecordId: BigInt, event: ethereum.Event): TaggingRecord {
  let taggingRecord = ensureTaggingRecord(taggingRecordId, event);

  if (taggingRecord && event) {
    let contract = ETS.bind(event.address);
    let taggingRecordCall = contract.try_getTaggingRecordFromId(taggingRecordId);

    if (taggingRecordCall.reverted) {
      logCritical("getTaggingRecordFromId reverted for {}", [taggingRecordId.toString()]);
    }

    let tags: BigInt[] = taggingRecordCall.value.getTagIds();
    let tagIDs: string[] = [];
    if (tags.length > 0) {
      for (let i = 0; i < tags.length; i++) {
        let ctag = ensureTag(tags[i], event);
        tagIDs.push(ctag.id.toString());
      }
    }

    taggingRecord.tags = tagIDs;
    taggingRecord.save();
  }
  return taggingRecord as TaggingRecord;
}
