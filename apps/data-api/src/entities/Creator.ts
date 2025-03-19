import { Address, BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensurePlatform, updateCreatorCount } from "../entities/Platform";
import { ensureTag } from "../entities/Tag";
import { AuctionSettled } from "../generated/ETSAuctionHouse/ETSAuctionHouse";
import { Transfer } from "../generated/ETSToken/ETSToken";
import { Creator } from "../generated/schema";
import { Platform, Tag } from "../generated/schema";
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
    creator.createdTagsAuctioned = ZERO;
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
    creator.createdTagsAuctioned = creator.createdTagsAuctioned.plus(ONE);
    creator.save();
  }
}

function updateCreatorRevenue(creator: Creator, tag: Tag, platform: Platform, ownerFee: GraphBigInt): void {
  creator.createdTagsAddedToTaggingRecords = creator.createdTagsAddedToTaggingRecords.plus(ONE);

  const ownerBytes = Address.fromString(tag.owner);
  const platformBytes = Address.fromString(platform.address);

  if (ownerBytes.equals(platformBytes)) {
    creator.createdTagsTaggingFeeRevenue = creator.createdTagsTaggingFeeRevenue.plus(ownerFee);
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

  const platform = ensurePlatform(null);
  const ownerFee = getTaggingFee(OWNER);

  if (action === CREATE) {
    for (let i = 0; i < newTagIds.length; i++) {
      const tag = ensureTag(GraphBigInt.fromString(newTagIds[i]), event);
      const creator = ensureCreator(Address.fromString(tag.creator), event);
      updateCreatorRevenue(creator, tag, platform, ownerFee);
    }
  }

  if (action === APPEND) {
    const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
    for (let i = 0; i < appendedTagIds.length; i++) {
      const tag = ensureTag(GraphBigInt.fromString(appendedTagIds[i]), event);
      const creator = ensureCreator(Address.fromString(tag.creator), event);
      updateCreatorRevenue(creator, tag, platform, ownerFee);
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
