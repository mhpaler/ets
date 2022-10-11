import { BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Platform } from "../generated/schema";
import { Transfer } from "../generated/ETSToken/ETSToken";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ZERO_ADDRESS, ZERO, ONE, ADDED, PAUSED, UNPAUSED } from "../utils/constants";

export function ensurePlatform(event: ethereum.Event | null): Platform {
  let platform = Platform.load("ETSPlatform");
  if (platform === null) {
    platform = new Platform("ETSPlatform");
    platform.address = ZERO.toHexString();
    if (event) {
      platform.firstSeen = event.block.timestamp;
    }
    platform.targetCount = ZERO;
    platform.tagsCount = ZERO;
    platform.taggingRecordsCount = ZERO;
    platform.taggingFeesRevenue = ZERO;
    platform.auctionRevenue = ZERO;
    platform.publisherCountActive = ZERO;
    platform.publisherCountLifetime = ZERO;
    platform.taggerCount = ZERO;
    platform.creatorCount = ZERO;
    platform.ownerCount = ZERO;
    platform.save();
  }
  return platform as Platform;
}

export function updateTargetCount(event: ethereum.Event): void {
  let platform = ensurePlatform(event);
  platform.targetCount = platform.targetCount.plus(ONE);
  platform.save();
}

// Track CTAGs minted; see ETSToken.ts
export function updatePlatformTagStats(event: Transfer): void {
  let platform = ensurePlatform(event);
  if (platform && event.params.from.toHexString() == ZERO_ADDRESS) {
    platform.tagsCount = platform.tagsCount.plus(ONE);
    platform.save();
  }
}

export function updatePlatformTaggingRecordStats(tagIds: string[] | null, event: ethereum.Event): void {
  let platform = ensurePlatform(event);
  platform.taggingRecordsCount = platform.taggingRecordsCount.plus(ONE);

  if (tagIds && tagIds.length > 0) {
    let settings = ensureGlobalSettings();

    platform.taggingFeesRevenue = platform.taggingFeesRevenue.plus(
      BigInt.fromI32(tagIds.length).times(settings.taggingFee),
    );
  }

  platform.save();
}

export function updatePublisherCount(action: BigInt, event: ethereum.Event): void {
  let platform = ensurePlatform(event);
  // Action ZERO is used to decrement count.
  if (platform) {
    if (action == ADDED) {
      platform.publisherCountLifetime = platform.publisherCountLifetime.plus(ONE);
      platform.publisherCountActive = platform.publisherCountActive.plus(ONE);
    }

    if (action == PAUSED) {
      platform.publisherCountActive = platform.publisherCountActive.minus(ONE);
    }

    if (action == UNPAUSED) {
      platform.publisherCountActive = platform.publisherCountActive.plus(ONE);
    }
    platform.save();
  }
}

export function updateTaggerCount(event: ethereum.Event): void {
  let platform = ensurePlatform(event);
  platform.taggerCount = platform.taggerCount.plus(ONE);
  platform.save();
}

export function updateCreatorCount(event: ethereum.Event): void {
  let platform = ensurePlatform(event);
  platform.creatorCount = platform.creatorCount.plus(ONE);
  platform.save();
}

export function updateOwnerCount(event: ethereum.Event): void {
  let platform = ensurePlatform(event);
  platform.ownerCount = platform.ownerCount.plus(ONE);
  platform.save();
}
