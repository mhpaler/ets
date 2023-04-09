import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts/index";
import { Release, Platform, Tag } from "../generated/schema";
import { ETSToken } from "../generated/ETSToken/ETSToken";
import { ensurePlatform } from "../entities/Platform";
import { getTaggingFee } from "../utils/getTaggingFee";
import { logCritical } from "../utils/logCritical";
import { toLowerCase } from "../utils/helpers";
import { arrayDiff } from "../utils/arrayDiff";
import { ZERO, ONE, CREATE, APPEND, REMOVE, PLATFORM, RELAYER, OWNER } from "../utils/constants";

export function ensureTag(id: BigInt, event: ethereum.Event): Tag {
  let tag = Tag.load(id.toString());
  let release = Release.load("ETSRelease");
  let platform = Platform.load("ETSPlatform");

  if (tag === null && release && platform && event) {
    tag = new Tag(id.toString());

    let contract = ETSToken.bind(Address.fromString(release.etsToken));
    let getTagCall = contract.try_getTagById(id);
    if (getTagCall.reverted) {
      logCritical("getTagCall reverted for {}", [id.toString()]);
    }
    let lowerTag: string = toLowerCase(getTagCall.value.display);
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

export function updateCTAGTaggingRecordStats(
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: BigInt,
  event: ethereum.Event,
): void {
  if (newTagIds && previousTagIds) {
    let platform = ensurePlatform(null);
    let platformFee = getTaggingFee(PLATFORM);
    let relayerFee = getTaggingFee(RELAYER);
    let ownerFee = getTaggingFee(OWNER);

    if (action == CREATE) {
      for (let i = 0; i < newTagIds.length; i++) {
        let tag = ensureTag(BigInt.fromString(newTagIds[i]), event);
        tag.tagAppliedInTaggingRecord = tag.tagAppliedInTaggingRecord.plus(ONE);
        tag.protocolRevenue = tag.protocolRevenue.plus(platformFee);
        tag.relayerRevenue = tag.relayerRevenue.plus(relayerFee);
        if (tag.owner != platform.address) {
          tag.ownerRevenue = tag.ownerRevenue.plus(ownerFee);
        } else {
          tag.creatorRevenue = tag.creatorRevenue.plus(ownerFee);
        }
        tag.save();
      }
    }

    if (action == APPEND) {
      let appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      for (let i = 0; i < appendedTagIds.length; i++) {
        let tag = ensureTag(BigInt.fromString(appendedTagIds[i]), event);
        tag.tagAppliedInTaggingRecord = tag.tagAppliedInTaggingRecord.plus(ONE);
        tag.protocolRevenue = tag.protocolRevenue.plus(platformFee);
        tag.relayerRevenue = tag.relayerRevenue.plus(relayerFee);
        if (tag.owner != platform.address) {
          tag.ownerRevenue = tag.ownerRevenue.plus(ownerFee);
        } else {
          tag.creatorRevenue = tag.creatorRevenue.plus(ownerFee);
        }
        tag.save();
      }
    }

    if (action == REMOVE) {
      let removedTagIds = arrayDiff(previousTagIds, newTagIds);
      for (let i = 0; i < removedTagIds.length; i++) {
        let tag = ensureTag(BigInt.fromString(removedTagIds[i]), event);
        tag.tagRemovedFromTaggingRecord = tag.tagRemovedFromTaggingRecord.plus(ONE);
        tag.save();
      }
    }
  }
}
