import { Address, BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { log } from "@graphprotocol/graph-ts";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensureTag } from "../entities/Tag";
import { AuctionSettled } from "../generated/ETSAuctionHouse/ETSAuctionHouse";
import { Transfer } from "../generated/ETSToken/ETSToken";
import { GlobalSettings, Platform } from "../generated/schema";
import { ADDED, MODULO, ONE, PAUSED, UNPAUSED, ZERO, ZERO_ADDRESS } from "../utils/constants";
import { ensureAuction } from "./Auction";

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
    platform.auctionsSettled = ZERO;
    platform.auctionRevenue = ZERO;
    platform.relayerCountActive = ZERO;
    platform.relayerCountLifetime = ZERO;
    platform.taggerCount = ZERO;
    platform.creatorCount = ZERO;
    platform.ownerCount = ZERO;
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

export function updatePlatformTagStats(event: Transfer): void {
  const platform = ensurePlatform(event);
  const fromAddress = event.params.from;
  const zeroAddress = Address.fromString(ZERO_ADDRESS);

  if (fromAddress.equals(zeroAddress)) {
    platform.tagsCount = platform.tagsCount.plus(ONE);
    platform.save();
  }
}

export function updateRelayerCount(action: GraphBigInt, event: ethereum.Event): void {
  const platform = ensurePlatform(event);

  if (action === ADDED) {
    platform.relayerCountLifetime = platform.relayerCountLifetime.plus(ONE);
    platform.relayerCountActive = platform.relayerCountActive.plus(ONE);
  }

  if (action === PAUSED) {
    platform.relayerCountActive = platform.relayerCountActive.minus(ONE);
  }

  if (action === UNPAUSED) {
    platform.relayerCountActive = platform.relayerCountActive.plus(ONE);
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

export function updateOwnerCount(event: ethereum.Event): void {
  const platform = ensurePlatform(event);
  platform.ownerCount = platform.ownerCount.plus(ONE);
  platform.save();
}

export function updatePlatformAuctionStats(auctionId: GraphBigInt, event: AuctionSettled): void {
  const auction = ensureAuction(auctionId, event);
  //const tag = ensureTag(GraphBigInt.fromString(auction.tag), event);
  const platform = ensurePlatform(event);
  if (platform && event) {
    // pull percentages from settings.
    const settings = ensureGlobalSettings();
    const platformAuctionRevenue = auction.amount.times(settings.platformPercentage).div(MODULO);
    platform.auctionRevenue = platform.auctionRevenue.plus(platformAuctionRevenue);
    platform.auctionsSettled = platform.auctionsSettled.plus(ONE);
    platform.save();
  }
}
