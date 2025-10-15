import { log } from "@graphprotocol/graph-ts";
import { Address, BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts/index";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensurePlatform } from "../entities/Platform";
import { ETSToken } from "../generated/ETSToken/ETSToken";
import { Platform, Release, Tag, TagByCoinAddress, TagByNumber } from "../generated/schema";
import { arrayDiff } from "../utils/arrayDiff";
import { APPEND, CREATE, ONE, PLATFORM, REMOVE, ZERO } from "../utils/constants";
import { getTaggingFee } from "../utils/getTaggingFee";

export function ensureTag(compositeId: string, _event: ethereum.Event): Tag {
  const tag = Tag.load(compositeId);

  if (tag === null) {
    // For new tags, we'll create them from the TagCreated event
    // This function should only be called after a tag is created
    log.warning("Tag not found for compositeId: {}", [compositeId]);
  }

  return tag as Tag;
}

export function createTag(
  tagId: GraphBigInt,
  coinAddress: Address,
  originalInput: string,
  displayVersion: string,
  machineName: string,
  creator: Address,
  channel: Address,
  timestamp: GraphBigInt,
): void {
  // Create composite ID
  const compositeId = `${tagId.toString()}-${coinAddress.toHexString()}`;

  // Create main Tag entity
  const tag = new Tag(compositeId);
  tag.tagId = tagId;
  tag.coinAddress = coinAddress;
  tag.originalInput = originalInput;
  tag.displayVersion = displayVersion;
  tag.machineName = machineName;
  tag.creator = creator.toHexString();
  tag.channel = channel.toHexString();
  tag.timestamp = timestamp;
  tag.tagAppliedInTaggingRecord = ZERO;
  tag.tagRemovedFromTaggingRecord = ZERO;
  tag.platformRevenue = ZERO;
  tag.save();

  // Create lookup by number
  const byNumber = new TagByNumber(tagId.toString());
  byNumber.tag = compositeId;
  byNumber.save();

  // Create lookup by coin address
  const byAddress = new TagByCoinAddress(coinAddress.toHexString());
  byAddress.tag = compositeId;
  byAddress.save();
}

export function getTagByNumber(tagId: GraphBigInt): Tag | null {
  const byNumber = TagByNumber.load(tagId.toString());
  if (byNumber) {
    return Tag.load(byNumber.tag);
  }
  return null;
}

export function getTagByCoinAddress(coinAddress: Address): Tag | null {
  const byAddress = TagByCoinAddress.load(coinAddress.toHexString());
  if (byAddress) {
    return Tag.load(byAddress.tag);
  }
  return null;
}

function updateTagRevenue(tag: Tag, platformFee: GraphBigInt): void {
  tag.tagAppliedInTaggingRecord = tag.tagAppliedInTaggingRecord.plus(ONE);
  // In MVP, 100% goes to platform
  tag.platformRevenue = tag.platformRevenue.plus(platformFee);
  tag.save();
}

export function updateTaggingRecordStats(
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: GraphBigInt,
  event: ethereum.Event,
): void {
  if (newTagIds && previousTagIds) {
    const platformFee = getTaggingFee(PLATFORM);

    if (action === CREATE) {
      for (let i = 0; i < newTagIds.length; i++) {
        const tag = ensureTag(newTagIds[i], event);
        if (tag) {
          updateTagRevenue(tag, platformFee);
        }
      }
    }

    if (action === APPEND) {
      const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      for (let i = 0; i < appendedTagIds.length; i++) {
        const tag = ensureTag(appendedTagIds[i], event);
        if (tag) {
          updateTagRevenue(tag, platformFee);
        }
      }
    }

    if (action === REMOVE) {
      const removedTagIds = arrayDiff(previousTagIds, newTagIds);
      for (let i = 0; i < removedTagIds.length; i++) {
        const tag = ensureTag(removedTagIds[i], event);
        if (tag) {
          tag.tagRemovedFromTaggingRecord = tag.tagRemovedFromTaggingRecord.plus(ONE);
          tag.save();
        }
      }
    }
  }
}
