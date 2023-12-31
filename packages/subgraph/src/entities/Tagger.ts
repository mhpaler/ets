import { Tagger } from "../generated/schema";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { updateTaggerCount } from "../entities/Platform";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ZERO, ONE, CREATE, APPEND, REMOVE } from "../utils/constants";
import { arrayDiff } from "../utils/arrayDiff";

export function ensureTagger(taggerAddress: Address, event: ethereum.Event): Tagger {
  let tagger = Tagger.load(taggerAddress.toHex());
  if (tagger === null && event) {
    tagger = new Tagger(taggerAddress.toHex());
    tagger.firstSeen = event.block.timestamp;
    tagger.taggingRecordsCreated = ZERO;
    tagger.taggingRecordTxns = ZERO;
    tagger.tagsApplied = ZERO;
    tagger.tagsRemoved = ZERO;
    tagger.feesPaid = ZERO;
    tagger.tags = [];
    tagger.save();

    updateTaggerCount(event);
  }

  return tagger as Tagger;
}

export function updateTaggerTaggingRecordStats(
  taggerAddress: Address,
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: BigInt,
  event: ethereum.Event,
): void {
  let tagger = ensureTagger(taggerAddress, event);

  // Log the transaction in tagger lifetime count regardless of action.
  tagger.taggingRecordTxns = tagger.taggingRecordTxns.plus(ONE);

  if (action == CREATE && newTagIds) {
    tagger.taggingRecordsCreated = tagger.taggingRecordsCreated.plus(ONE);
  }

  if (tagger.tags && newTagIds && previousTagIds) {
    let settings = ensureGlobalSettings();

    if (action == CREATE) {
      tagger.tags = tagger.tags.concat(newTagIds);
      tagger.tagsApplied = tagger.tagsApplied.plus(BigInt.fromI32(newTagIds.length));
      tagger.feesPaid = tagger.feesPaid.plus(BigInt.fromI32(newTagIds.length).times(settings.taggingFee));
    }

    if (action == APPEND) {
      // newTags - previousTags
      let appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      tagger.tags = tagger.tags.concat(appendedTagIds);
      tagger.tagsApplied = tagger.tagsApplied.plus(BigInt.fromI32(appendedTagIds.length));
      tagger.feesPaid = tagger.feesPaid.plus(BigInt.fromI32(appendedTagIds.length).times(settings.taggingFee));
    }

    if (action == REMOVE) {
      let removedTagIds = arrayDiff(previousTagIds, newTagIds);
      tagger.tags = arrayDiff(tagger.tags, removedTagIds);
      tagger.tagsRemoved = tagger.tagsRemoved.plus(BigInt.fromI32(removedTagIds.length));
    }
  }

  tagger.save();
}
