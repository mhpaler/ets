import { Address, BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { GlobalSettings, Platform } from "../generated/schema";
import { ADDED, ONE, PAUSED, UNPAUSED, ZERO, ZERO_ADDRESS } from "../utils/constants";

export function ensurePlatform(event: ethereum.Event | null): Platform {
  let platform = Platform.load("ETSPlatform");
  if (platform === null) {
    platform = new Platform("ETSPlatform");
    platform.address = ZERO_ADDRESS;
    if (event) {
      platform.firstSeen = event.block.timestamp;
    }
    platform.targetCount = ZERO;
    platform.tagsCount = ZERO;
    platform.taggingRecordsCount = ZERO;
    platform.taggingFeesRevenue = ZERO;
    platform.channelCountActive = ZERO;
    platform.channelCountLifetime = ZERO;
    platform.taggerCount = ZERO;
    platform.creatorCount = ZERO;
    platform.save();
  }
  return platform as Platform;
}

export function updateTargetCount(event: ethereum.Event): void {
  const platform = ensurePlatform(event);
  platform.targetCount = platform.targetCount.plus(ONE);
  platform.save();
}

function updatePlatformRevenue(platform: Platform, tagIds: string[], settings: GlobalSettings): void {
  platform.taggingRecordsCount = platform.taggingRecordsCount.plus(ONE);

  if (tagIds && tagIds.length > 0) {
    platform.taggingFeesRevenue = platform.taggingFeesRevenue.plus(
      GraphBigInt.fromI32(tagIds.length).times(settings.taggingFee),
    );
  }
  platform.save();
}

export function updatePlatformTaggingRecordStats(tagIds: string[] | null, event: ethereum.Event): void {
  if (!tagIds) return;

  const platform = ensurePlatform(event);
  const settings = ensureGlobalSettings();
  updatePlatformRevenue(platform, tagIds, settings);
}

export function updateChannelCount(action: GraphBigInt, event: ethereum.Event): void {
  const platform = ensurePlatform(event);

  if (action === ADDED) {
    platform.channelCountLifetime = platform.channelCountLifetime.plus(ONE);
    platform.channelCountActive = platform.channelCountActive.plus(ONE);
  }

  if (action === PAUSED) {
    platform.channelCountActive = platform.channelCountActive.minus(ONE);
  }

  if (action === UNPAUSED) {
    platform.channelCountActive = platform.channelCountActive.plus(ONE);
  }
  platform.save();
}

export function updateTaggerCount(event: ethereum.Event): void {
  const platform = ensurePlatform(event);
  platform.taggerCount = platform.taggerCount.plus(ONE);
  platform.save();
}

export function updateCreatorCount(event: ethereum.Event): void {
  const platform = ensurePlatform(event);
  platform.creatorCount = platform.creatorCount.plus(ONE);
  platform.save();
}
