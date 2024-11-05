import { Address, BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensurePlatform, updateCreatorCount } from "../entities/Platform";
import { ensureTag } from "../entities/Tag";
import { AuctionSettled } from "../generated/ETSAuctionHouse/ETSAuctionHouse";
import { Transfer } from "../generated/ETSToken/ETSToken";
import { Creator } from "../generated/schema";
import { arrayDiff } from "../utils/arrayDiff";
import { APPEND, CREATE, MODULO, ONE, OWNER, REMOVE, ZERO, ZERO_ADDRESS } from "../utils/constants";
import { getTaggingFee } from "../utils/getTaggingFee";
import { ensureAuction } from "./Auction";

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
  const creator = ensureCreator(creatorAddress, event);
  const fromAddress = event.params.from;
  const zeroAddress = Address.fromString(ZERO_ADDRESS);

  if (fromAddress.equals(zeroAddress)) {
    creator.tagsCreated = creator.tagsCreated.plus(ONE);
    creator.save();
  }
}

export function updateCreatorAuctionStats(auctionId: GraphBigInt, event: AuctionSettled): void {
  const auction = ensureAuction(auctionId, event);
  const tag = ensureTag(GraphBigInt.fromString(auction.tag), event);
  const creator = ensureCreator(Address.fromString(tag.creator), event);
  if (creator && event) {
    // pull percentages from settings.
    const settings = ensureGlobalSettings();
    const creatorAuctionRevenue = auction.amount.times(settings.creatorPercentage).div(MODULO);
    creator.createdTagsAuctionRevenue = creator.createdTagsAuctionRevenue.plus(creatorAuctionRevenue);
    creator.save();
  }
}

export function updateCreatorTaggingRecordStats(
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: GraphBigInt,
  event: ethereum.Event,
): void {
  if (newTagIds && previousTagIds) {
    // Go through each tag in the tagging record and update stats for the creator of that tag.
    const platform = ensurePlatform(null);

    if (action === CREATE) {
      for (let i = 0; i < newTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(newTagIds[i]), event);
        const creator = ensureCreator(Address.fromString(tag.creator), event);
        creator.createdTagsAddedToTaggingRecords = creator.createdTagsAddedToTaggingRecords.plus(ONE);
        if (tag.owner === platform.address) {
          // Until the tag is purchased, owner portion of tagging fee goes to creator.
          const creatorFee = getTaggingFee(OWNER);
          creator.createdTagsTaggingFeeRevenue = creator.createdTagsTaggingFeeRevenue.plus(creatorFee);
        }
        creator.save();
      }
    }

    if (action === APPEND) {
      const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      for (let i = 0; i < appendedTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(appendedTagIds[i]), event);
        const creator = ensureCreator(Address.fromString(tag.creator), event);
        creator.createdTagsAddedToTaggingRecords = creator.createdTagsAddedToTaggingRecords.plus(ONE);
        if (tag.owner === platform.address) {
          // Until the tag is purchased, owner portion of tagging fee goes to creator.
          const creatorFee = getTaggingFee(OWNER);
          creator.createdTagsTaggingFeeRevenue = creator.createdTagsTaggingFeeRevenue.plus(creatorFee);
        }
        creator.save();
      }
    }

    if (action === REMOVE) {
      const removedTagIds = arrayDiff(previousTagIds, newTagIds);
      for (let i = 0; i < removedTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(removedTagIds[i]), event);
        const creator = ensureCreator(Address.fromString(tag.creator), event);
        creator.createdTagsRemovedFromTaggingRecords = creator.createdTagsRemovedFromTaggingRecords.plus(ONE);
        creator.save();
      }
    }
  }
}
