import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Platform } from "../generated/schema";
import { Transfer } from "../generated/ETSToken/ETSToken";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ZERO_ADDRESS, ZERO, ONE } from "../utils/constants";

export function ensurePlatform(event: ethereum.Event | null): Platform {
  let platform = Platform.load("ETSPlatform");
  if (platform === null) {
    platform = new Platform("ETSPlatform");
    platform.address = ZERO.toHexString();
    if (event) {
      platform.firstSeen = event.block.timestamp;
    }
    platform.tagsCount = ZERO;
    platform.taggingRecordsCount = ZERO;
    platform.taggingFeesRevenue = ZERO;
    platform.auctionRevenue = ZERO;
    platform.save();
  }
  return platform as Platform;
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
