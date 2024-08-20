import { Address, BigInt as GraphBigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { ensurePlatform, updateOwnerCount } from "../entities/Platform";
import { ensureTag } from "../entities/Tag";
import { Transfer } from "../generated/ETSToken/ETSToken";
import { Owner, Platform } from "../generated/schema";
import { arrayDiff } from "../utils/arrayDiff";
import { APPEND, CREATE, ONE, OWNER, REMOVE, ZERO, ZERO_ADDRESS } from "../utils/constants";
import { getTaggingFee } from "../utils/getTaggingFee";

export function ensureOwner(ownerAddress: Address, event: ethereum.Event): Owner {
  let owner = Owner.load(ownerAddress.toHex());

  if (owner === null) {
    owner = new Owner(ownerAddress.toHex());
    owner.firstSeen = event.block.timestamp;
    owner.tagsOwned = ZERO;
    owner.tagsOwnedLifeTime = ZERO;
    owner.ownedTagsAddedToTaggingRecords = ZERO;
    owner.ownedTagsRemovedFromTaggingRecords = ZERO;
    owner.ownedTagsTaggingFeeRevenue = ZERO;
    owner.save();

    if (ownerAddress.toHex() !== ZERO_ADDRESS) {
      updateOwnerCount(event);
    }
  }

  return owner as Owner;
}

export function updateOwnerTagStats(event: Transfer): void {
  //let from = event.params.from.toHexString();
  const from = ensureOwner(event.params.from, event);
  const to = ensureOwner(event.params.to, event);
  const platform = Platform.load("ETSPlatform");

  // Handle new CTAG Minted.
  if (platform && to.id === platform.address && from.id === ZERO_ADDRESS) {
    to.tagsOwned = to.tagsOwned.plus(ONE);
    to.tagsOwnedLifeTime = to.tagsOwnedLifeTime.plus(ONE);
    to.save();
  }

  // Handle CTAG Sold at Auction.
  if (platform && to.id !== ZERO_ADDRESS && from.id === platform.address) {
    to.tagsOwned = to.tagsOwned.plus(ONE);
    to.tagsOwnedLifeTime = to.tagsOwnedLifeTime.plus(ONE);
    to.save();

    from.tagsOwned = from.tagsOwned.minus(ONE);
    from.save();
  }

  // Handle CTAG Recycled.
  if (platform && to.id === platform.address && from.id !== ZERO_ADDRESS) {
    to.tagsOwned = to.tagsOwned.plus(ONE);
    to.save();

    from.tagsOwned = from.tagsOwned.minus(ONE);
    from.save();
  }

  // Handle CTAG transfer outside platform.
  if (
    platform &&
    to.id !== platform.address &&
    from.id !== platform.address &&
    to.id !== ZERO_ADDRESS &&
    from.id !== ZERO_ADDRESS
  ) {
    to.tagsOwned = to.tagsOwned.plus(ONE);
    // ! This one maybe doesn't make sense.
    to.tagsOwnedLifeTime = to.tagsOwnedLifeTime.plus(ONE);
    to.save();

    from.tagsOwned = from.tagsOwned.minus(ONE);
    from.save();
  }
}

export function updateOwnerTaggingRecordStats(
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: GraphBigInt,
  event: ethereum.Event,
): void {
  if (newTagIds && previousTagIds) {
    const platform = ensurePlatform(null);

    if (action === CREATE) {
      for (let i = 0; i < newTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(newTagIds[i]), event);
        const owner = ensureOwner(Address.fromString(tag.owner), event);
        owner.ownedTagsAddedToTaggingRecords = owner.ownedTagsAddedToTaggingRecords.plus(ONE);
        if (tag.owner !== platform.address) {
          const ownerFee = getTaggingFee(OWNER);
          owner.ownedTagsTaggingFeeRevenue = owner.ownedTagsTaggingFeeRevenue.plus(ownerFee);
        }
        owner.save();
      }
    }

    if (action === APPEND) {
      const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      for (let i = 0; i < appendedTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(appendedTagIds[i]), event);
        const owner = ensureOwner(Address.fromString(tag.owner), event);
        owner.ownedTagsAddedToTaggingRecords = owner.ownedTagsAddedToTaggingRecords.plus(ONE);
        if (tag.owner !== platform.address) {
          const ownerFee = getTaggingFee(OWNER);
          owner.ownedTagsTaggingFeeRevenue = owner.ownedTagsTaggingFeeRevenue.plus(ownerFee);
        }
        owner.save();
      }
    }

    if (action === REMOVE) {
      const removedTagIds = arrayDiff(previousTagIds, newTagIds);

      for (let i = 0; i < removedTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(removedTagIds[i]), event);
        const owner = ensureOwner(Address.fromString(tag.owner), event);
        owner.ownedTagsRemovedFromTaggingRecords = owner.ownedTagsRemovedFromTaggingRecords.plus(ONE);
        owner.save();
      }
    }
  }
}
