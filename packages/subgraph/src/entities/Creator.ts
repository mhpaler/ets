import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Creator } from "../generated/schema";
import { Transfer } from "../generated/ETSToken/ETSToken";
import { ensurePlatform, updateCreatorCount } from "../entities/Platform";
import { ensureTag } from "../entities/Tag";
import { getTaggingFee } from "../utils/getTaggingFee";
import { arrayDiff } from "../utils/arrayDiff";
import { ZERO_ADDRESS, ZERO, ONE, CREATE, APPEND, REMOVE, OWNER } from "../utils/constants";

export function ensureCreator(creatorAddress: Address, event: ethereum.Event): Creator {
  let creator = Creator.load(creatorAddress.toHex());

  if (creator === null) {
    creator = new Creator(creatorAddress.toHex());
    creator.firstSeen = event.block.timestamp;
    creator.tagsCreated = ZERO;
    creator.createdTagsAuctionRevenue = ZERO;
    creator.createdTagsAddedToTaggingRecords = ZERO;
    creator.createdTagsRemovedFromTaggingRecords = ZERO;
    creator.createdTagsTaggingFeeRevenue = ZERO;
    creator.save();

    updateCreatorCount(event);
  }
  return creator as Creator;
}

export function updateCreatorTagStats(creatorAddress: Address, event: Transfer): void {
  let creator = ensureCreator(creatorAddress, event);
  if (creator && event.params.from.toHexString() == ZERO_ADDRESS) {
    creator.tagsCreated = creator.tagsCreated.plus(ONE);
    creator.save();
  }
}

export function updateCreatorTaggingRecordStats(
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: BigInt,
  event: ethereum.Event,
): void {
  if (newTagIds && previousTagIds) {
    // Go through each tag in the tagging record and update stats for the creator of that tag.
    let platform = ensurePlatform(null);

    if (action == CREATE) {
      for (let i = 0; i < newTagIds.length; i++) {
        let tag = ensureTag(BigInt.fromString(newTagIds[i]), event);
        let creator = ensureCreator(Address.fromString(tag.creator), event);
        creator.createdTagsAddedToTaggingRecords = creator.createdTagsAddedToTaggingRecords.plus(ONE);
        if (tag.owner == platform.address) {
          // Until the tag is purchased, owner portion of tagging fee goes to creator.
          let creatorFee = getTaggingFee(OWNER);
          creator.createdTagsTaggingFeeRevenue = creator.createdTagsTaggingFeeRevenue.plus(creatorFee);
        }
        creator.save();
      }
    }

    if (action == APPEND) {
      let appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      for (let i = 0; i < appendedTagIds.length; i++) {
        let tag = ensureTag(BigInt.fromString(appendedTagIds[i]), event);
        let creator = ensureCreator(Address.fromString(tag.creator), event);
        creator.createdTagsAddedToTaggingRecords = creator.createdTagsAddedToTaggingRecords.plus(ONE);
        if (tag.owner == platform.address) {
          // Until the tag is purchased, owner portion of tagging fee goes to creator.
          let creatorFee = getTaggingFee(OWNER);
          creator.createdTagsTaggingFeeRevenue = creator.createdTagsTaggingFeeRevenue.plus(creatorFee);
        }
        creator.save();
      }
    }

    if (action == REMOVE) {
      let removedTagIds = arrayDiff(previousTagIds, newTagIds);
      for (let i = 0; i < removedTagIds.length; i++) {
        let tag = ensureTag(BigInt.fromString(removedTagIds[i]), event);
        let creator = ensureCreator(Address.fromString(tag.creator), event);
        creator.createdTagsRemovedFromTaggingRecords = creator.createdTagsRemovedFromTaggingRecords.plus(ONE);
        creator.save();
      }
    }
  }
}
