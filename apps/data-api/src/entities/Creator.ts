import { Address, BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensurePlatform, updateCreatorCount } from "../entities/Platform";
import { ensureTag } from "../entities/Tag";
import { TagCreated } from "../generated/ETSToken/ETSToken";
import { Creator, Platform, Tag } from "../generated/schema";
import { arrayDiff } from "../utils/arrayDiff";
import { APPEND, CREATE, MODULO, ONE, OWNER, REMOVE, ZERO, ZERO_ADDRESS } from "../utils/constants";
import { getTaggingFee } from "../utils/getTaggingFee";

export function ensureCreator(creatorAddress: Address, event: ethereum.Event): Creator {
  let creator = Creator.load(creatorAddress.toHex());

  if (creator === null) {
    creator = new Creator(creatorAddress.toHex());
    creator.firstSeen = event.block.timestamp;
    creator.tagsCreated = ZERO;
    creator.createdTagsAddedToTaggingRecords = ZERO;
    creator.createdTagsRemovedFromTaggingRecords = ZERO;
    creator.createdTagsTaggingFeeRevenue = ZERO;
    creator.save();

    updateCreatorCount(event);
  }
  return creator as Creator;
}

export function updateCreatorTagStats(creatorAddress: Address, event: TagCreated): void {
  const creator = ensureCreator(creatorAddress, event);

  creator.tagsCreated = creator.tagsCreated.plus(ONE);
  creator.save();
}

function updateCreatorRevenue(creator: Creator, tag: Tag, creatorFee: GraphBigInt): void {
  creator.createdTagsAddedToTaggingRecords = creator.createdTagsAddedToTaggingRecords.plus(ONE);

  // In TAG Coins model, creators get revenue from their tags being used
  const creatorAddress = Address.fromString(creator.id);
  const tagCreatorAddress = Address.fromString(tag.creator);

  if (creatorAddress.equals(tagCreatorAddress)) {
    creator.createdTagsTaggingFeeRevenue = creator.createdTagsTaggingFeeRevenue.plus(creatorFee);
  }
  creator.save();
}

export function updateCreatorTaggingRecordStats(
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: GraphBigInt,
  event: ethereum.Event,
): void {
  if (!newTagIds || !previousTagIds) return;

  const creatorFee = getTaggingFee(OWNER); // Using OWNER constant for creator fee

  if (action === CREATE) {
    for (let i = 0; i < newTagIds.length; i++) {
      const tag = ensureTag(newTagIds[i], event);
      const creator = ensureCreator(Address.fromString(tag.creator), event);
      updateCreatorRevenue(creator, tag, creatorFee);
    }
  }

  if (action === APPEND) {
    const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
    for (let i = 0; i < appendedTagIds.length; i++) {
      const tag = ensureTag(appendedTagIds[i], event);
      const creator = ensureCreator(Address.fromString(tag.creator), event);
      updateCreatorRevenue(creator, tag, creatorFee);
    }
  }

  if (action === REMOVE) {
    const removedTagIds = arrayDiff(previousTagIds, newTagIds);
    for (let i = 0; i < removedTagIds.length; i++) {
      const tag = ensureTag(removedTagIds[i], event);
      const creator = ensureCreator(Address.fromString(tag.creator), event);
      creator.createdTagsRemovedFromTaggingRecords = creator.createdTagsRemovedFromTaggingRecords.plus(ONE);
      creator.save();
    }
  }
}
