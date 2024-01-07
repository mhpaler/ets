import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  Initialized,
  Upgraded,
  AuctionsMaxSet,
  AuctionDurationSet,
  AuctionMinBidIncrementPercentageSet,
  AuctionReservePriceSet,
  AuctionTimeBufferSet,
  AuctionProceedPercentagesSet,
  RequestCreateAuction,
  AuctionCreated,
  AuctionBid,
  AuctionExtended,
  AuctionSettled,
  AuctionProceedsWithdrawn,
} from "../generated/ETSAuctionHouse/ETSAuctionHouse";

import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensureRelease } from "../entities/Release";
import { ensureAuction, updateAuction } from "../entities/Auction";
import { ensureBid } from "../entities/Bid";
import { updateCreatorAuctionStats } from "../entities/Creator";
// import { updatePlatformTaggingRecordStats } from "../entities/Platform";
// import { updateRelayerTaggingRecordStats } from "../entities/Relayer";
// import { updateTaggerTaggingRecordStats } from "../entities/Tagger";
// import { updateCreatorTaggingRecordStats } from "../entities/Creator";
// import { updateOwnerTaggingRecordStats } from "../entities/Owner";
// import { updateCTAGTaggingRecordStats } from "../entities/Tag";
// import { ensureTaggingRecord, updateTaggingRecord } from "../entities/TaggingRecord";

export function handleInitialized(event: Initialized): void {
  let settings = ensureRelease();
  settings.etsAuctionHouse = event.address.toHexString();
  settings.etsAuctionHouseVersion = BigInt.fromI32(event.params.version);
  settings.etsAuctionHouseVersionDate = event.block.timestamp;
  settings.save();
}

export function handleUpgraded(event: Upgraded): void {}

export function handleAuctionsMaxSet(event: AuctionsMaxSet): void {
  let settings = ensureGlobalSettings();
  settings.maxAuctions = event.params.maxAuctions;
  settings.save();
}

export function handleAuctionMinBidIncrementPercentageSet(event: AuctionMinBidIncrementPercentageSet): void {
  let settings = ensureGlobalSettings();

  settings.minIncrementBidPercentage = BigInt.fromI32(event.params.minBidIncrementPercentagePrice);
  settings.save();
}

export function handleAuctionDurationSet(event: AuctionDurationSet): void {
  let settings = ensureGlobalSettings();
  settings.duration = event.params.duration;
  settings.save();
}

export function handleAuctionReservePriceSet(event: AuctionReservePriceSet): void {
  let settings = ensureGlobalSettings();
  settings.reservePrice = event.params.reservePrice;
  settings.save();
}

export function handleAuctionTimeBufferSet(event: AuctionTimeBufferSet): void {
  let settings = ensureGlobalSettings();
  settings.timeBuffer = event.params.timeBuffer;
  settings.save();
}

export function handleAuctionProceedPercentagesSet(event: AuctionProceedPercentagesSet): void {
  let settings = ensureGlobalSettings();
  settings.relayerPercentage = event.params.relayerPercentage;
  settings.creatorPercentage = event.params.creatorPercentage;
  settings.platformPercentage = event.params.platformPercentage;
  settings.save();
}

export function handleRequestCreateAuction(event: RequestCreateAuction): void {}

export function handleAuctionCreated(event: AuctionCreated): void {
  let auctionId = event.params.auctionId;
  ensureAuction(auctionId, event);
}

export function handleAuctionBid(event: AuctionBid): void {
  let auctionId = event.params.auctionId;
  ensureBid(auctionId, event);
}

export function handleAuctionExtended(event: AuctionExtended): void {
  let auctionId = event.params.auctionId;
  updateAuction(auctionId, event);
}

export function handleAuctionSettled(event: AuctionSettled): void {
  let auctionId = event.params.auctionId;
  updateAuction(auctionId, event);

  updateCreatorAuctionStats(auctionId, event);
}

export function handleAuctionProceedsWithdrawn(event: AuctionProceedsWithdrawn): void {}
