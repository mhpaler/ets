import { Address, BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts/index";
import { ensurePlatform } from "../entities/Platform";
import { ETSToken } from "../generated/ETSToken/ETSToken";
import { Platform, Release, Tag } from "../generated/schema";
import { arrayDiff } from "../utils/arrayDiff";
import { APPEND, CREATE, ONE, OWNER, PLATFORM, RELAYER, REMOVE, ZERO } from "../utils/constants";
import { getTaggingFee } from "../utils/getTaggingFee";
import { toLowerCase } from "../utils/helpers";
import { logCritical } from "../utils/logCritical";

export function ensureTag(id: GraphBigInt, event: ethereum.Event): Tag {
  let tag = Tag.load(id.toString());
  const release = Release.load("ETSRelease");
  const platform = Platform.load("ETSPlatform");

  if (tag === null && release && platform && event) {
    tag = new Tag(id.toString());

    const contract = ETSToken.bind(Address.fromString(release.etsToken));
    const getTagCall = contract.try_getTagById(id);
    if (getTagCall.reverted) {
      logCritical("getTagCall reverted for {}", [id.toString()]);
    }
    const lowerTag: string = toLowerCase(getTagCall.value.display);
    tag.machineName = lowerTag.substring(1, lowerTag.length);
    tag.display = getTagCall.value.display;
    tag.owner = platform.address;
    tag.creator = getTagCall.value.creator.toHexString();
    tag.relayer = getTagCall.value.relayer.toHexString();
    tag.timestamp = event.block.timestamp;
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
        tag.tagAppliedInTaggingRecord = tag.tagAppliedInTaggingRecord.plus(ONE);
        tag.protocolRevenue = tag.protocolRevenue.plus(platformFee);
        tag.relayerRevenue = tag.relayerRevenue.plus(relayerFee);
        if (tag.owner !== platform.address) {
          tag.ownerRevenue = tag.ownerRevenue.plus(ownerFee);
        } else {
          tag.creatorRevenue = tag.creatorRevenue.plus(ownerFee);
        }
        tag.save();
      }
    }

    if (action === APPEND) {
      const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      for (let i = 0; i < appendedTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(appendedTagIds[i]), event);
        tag.tagAppliedInTaggingRecord = tag.tagAppliedInTaggingRecord.plus(ONE);
        tag.protocolRevenue = tag.protocolRevenue.plus(platformFee);
        tag.relayerRevenue = tag.relayerRevenue.plus(relayerFee);
        if (tag.owner !== platform.address) {
          tag.ownerRevenue = tag.ownerRevenue.plus(ownerFee);
        } else {
          tag.creatorRevenue = tag.creatorRevenue.plus(ownerFee);
        }
        tag.save();
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
