import { Address, BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts/index";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensurePlatform } from "../entities/Platform";

import { log } from "@graphprotocol/graph-ts";
import { ETSToken } from "../generated/ETSToken/ETSToken";
import { Platform, Release, Tag } from "../generated/schema";
import { arrayDiff } from "../utils/arrayDiff";
import { APPEND, CREATE, ONE, OWNER, PLATFORM, RELAYER, REMOVE, ZERO } from "../utils/constants";
import { getTaggingFee } from "../utils/getTaggingFee";
import { toLowerCase } from "../utils/helpers";

export function ensureTag(id: GraphBigInt, event: ethereum.Event): Tag {
  let tag = Tag.load(id.toString());
  const release = Release.load("ETSRelease");
  const platform = Platform.load("ETSPlatform");

  if (tag === null && release && platform && event) {
    tag = new Tag(id.toString());
    const contract = ETSToken.bind(Address.fromString(release.etsToken));
    const getTagCall = contract.try_getTagById(id);

    if (getTagCall.reverted) {
      log.warning("getTagCall reverted for {}", [id.toString()]);
    }

    const lowerTag: string = toLowerCase(getTagCall.value.display);
    tag.machineName = lowerTag.substring(1, lowerTag.length);
    tag.display = getTagCall.value.display;
    tag.owner = platform.address;
    tag.creator = getTagCall.value.creator.toHexString();
    tag.relayer = getTagCall.value.relayer.toHexString();
    tag.timestamp = event.block.timestamp;
    tag.lastRenewalDate = ZERO;
    tag.lastRenewedBy = "";
    tag.expirationDate = ZERO;
    tag.lastRecycledDate = ZERO;
    tag.lastRecycledBy = "";
    tag.premium = getTagCall.value.premium;
    tag.reserved = getTagCall.value.reserved;
    tag.tagAppliedInTaggingRecord = ZERO;
    tag.tagRemovedFromTaggingRecord = ZERO;
    tag.relayerRevenue = ZERO;
    tag.protocolRevenue = ZERO;
    tag.creatorRevenue = ZERO;
    tag.ownerRevenue = ZERO;
    tag.save();
  }

  return tag as Tag;
}

export function updateTagOwner(tagId: GraphBigInt, newOwner: Address, event: ethereum.Event): void {
  const tag = ensureTag(tagId, event);
  tag.owner = newOwner.toHexString();
  tag.save();
}

/**
 * Updates a tag's expiration date and renewal information
 * @param tagId - The ID of the tag to update
 * @param sender - Address that triggered the renewal
 *
 * The expiration date is calculated by adding the ownership term length (in days)
 * converted to seconds to the last renewal timestamp.
 * If the tag is owned by the platform, both the last renewal date
 * and expiration date will be 0.
 */
export function updateTagExpiration(tagId: string, sender: Address): void {
  const settings = ensureGlobalSettings();
  const tag = Tag.load(tagId);
  const release = Release.load("ETSRelease");

  if (tag && release) {
    const contract = ETSToken.bind(Address.fromString(release.etsToken));
    const lastRenewed = contract.getLastRenewed(GraphBigInt.fromString(tagId));
    const secondsInDay = GraphBigInt.fromI32(86400);
    tag.lastRenewalDate = lastRenewed;
    tag.lastRenewedBy = sender.toHexString();
    tag.expirationDate = lastRenewed.equals(ZERO)
      ? ZERO
      : lastRenewed.plus(settings.ownershipTermLength.times(secondsInDay));
    tag.save();
  }
}

export function updateTagRecycle(tagId: string, caller: Address, event: ethereum.Event): void {
  const tag = Tag.load(tagId);
  if (tag) {
    tag.lastRecycledDate = event.block.timestamp;
    tag.lastRecycledBy = caller.toHexString();
    tag.save();
  }
}

function updateTagRevenue(
  tag: Tag,
  platform: Platform,
  platformFee: GraphBigInt,
  relayerFee: GraphBigInt,
  ownerFee: GraphBigInt,
): void {
  tag.tagAppliedInTaggingRecord = tag.tagAppliedInTaggingRecord.plus(ONE);
  tag.protocolRevenue = tag.protocolRevenue.plus(platformFee);
  tag.relayerRevenue = tag.relayerRevenue.plus(relayerFee);

  const ownerBytes = Address.fromString(tag.owner);
  const platformBytes = Address.fromString(platform.address);

  if (!ownerBytes.equals(platformBytes)) {
    tag.ownerRevenue = tag.ownerRevenue.plus(ownerFee);
  } else {
    tag.creatorRevenue = tag.creatorRevenue.plus(ownerFee);
  }
  tag.save();
}

export function updateCTAGTaggingRecordStats(
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: GraphBigInt,
  event: ethereum.Event,
): void {
  if (newTagIds && previousTagIds) {
    const platform = ensurePlatform(null);
    const platformFee = getTaggingFee(PLATFORM);
    const relayerFee = getTaggingFee(RELAYER);
    const ownerFee = getTaggingFee(OWNER);

    if (action === CREATE) {
      for (let i = 0; i < newTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(newTagIds[i]), event);
        updateTagRevenue(tag, platform, platformFee, relayerFee, ownerFee);
      }
    }

    if (action === APPEND) {
      const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      for (let i = 0; i < appendedTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(appendedTagIds[i]), event);
        updateTagRevenue(tag, platform, platformFee, relayerFee, ownerFee);
      }
    }

    if (action === REMOVE) {
      const removedTagIds = arrayDiff(previousTagIds, newTagIds);
      for (let i = 0; i < removedTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(removedTagIds[i]), event);
        tag.tagRemovedFromTaggingRecord = tag.tagRemovedFromTaggingRecord.plus(ONE);
        tag.save();
      }
    }
  }
}
