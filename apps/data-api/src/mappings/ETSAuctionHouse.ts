import { BigInt as GraphBigInt } from "@graphprotocol/graph-ts";
import { ensureAuction, extendAuction, updateAuction } from "../entities/Auction";
import { ensureBid } from "../entities/Bid";
import { updateCreatorAuctionStats } from "../entities/Creator";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { updatePlatformAuctionStats } from "../entities/Platform";
import { updateRelayerAuctionStats } from "../entities/Relayer";
import { ensureRelease } from "../entities/Release";
import {
  AuctionBid,
  AuctionCreated,
  AuctionDurationSet,
  AuctionExtended,
  AuctionMinBidIncrementPercentageSet,
  AuctionProceedPercentagesSet,
  AuctionProceedsWithdrawn,
  AuctionReservePriceSet,
  AuctionSettled,
  AuctionTimeBufferSet,
  AuctionsMaxSet,
  Initialized,
  RequestCreateAuction,
  Upgraded,
} from "../generated/ETSAuctionHouse/ETSAuctionHouse";

export function handleInitialized(event: Initialized): void {
  const settings = ensureRelease();
  settings.etsAuctionHouse = event.address.toHexString();
  settings.etsAuctionHouseVersion = GraphBigInt.fromI32(event.params.version);
  settings.etsAuctionHouseVersionDate = event.block.timestamp;
  settings.save();
}

export function handleUpgraded(_event: Upgraded): void {}

export function handleAuctionsMaxSet(event: AuctionsMaxSet): void {
  const settings = ensureGlobalSettings();
  settings.maxAuctions = event.params.maxAuctions;
  settings.save();
}

export function handleAuctionMinBidIncrementPercentageSet(event: AuctionMinBidIncrementPercentageSet): void {
  const settings = ensureGlobalSettings();

  settings.minIncrementBidPercentage = GraphBigInt.fromI32(event.params.minBidIncrementPercentagePrice);
  settings.save();
}

export function handleAuctionDurationSet(event: AuctionDurationSet): void {
  const settings = ensureGlobalSettings();
  settings.duration = event.params.duration;
  settings.save();
}

export function handleAuctionReservePriceSet(event: AuctionReservePriceSet): void {
  const settings = ensureGlobalSettings();
  settings.reservePrice = event.params.reservePrice;
  settings.save();
}

export function handleAuctionTimeBufferSet(event: AuctionTimeBufferSet): void {
  const settings = ensureGlobalSettings();
  settings.timeBuffer = event.params.timeBuffer;
  settings.save();
}

export function handleAuctionProceedPercentagesSet(event: AuctionProceedPercentagesSet): void {
  const settings = ensureGlobalSettings();
  settings.relayerPercentage = event.params.relayerPercentage;
  settings.creatorPercentage = event.params.creatorPercentage;
  settings.platformPercentage = event.params.platformPercentage;
  settings.save();
}

export function handleRequestCreateAuction(_event: RequestCreateAuction): void {}

export function handleAuctionCreated(event: AuctionCreated): void {
  const auctionId = event.params.auctionId;
  ensureAuction(auctionId, event);
}

export function handleAuctionBid(event: AuctionBid): void {
  const auctionId = event.params.auctionId;
  ensureBid(auctionId, event);
}

export function handleAuctionExtended(event: AuctionExtended): void {
  const auctionId = event.params.auctionId;
  extendAuction(auctionId, event);
}

export function handleAuctionSettled(event: AuctionSettled): void {
  const auctionId = event.params.auctionId;
  updateAuction(auctionId, event);
  updateCreatorAuctionStats(auctionId, event);
  updateRelayerAuctionStats(auctionId, event);
  updatePlatformAuctionStats(auctionId, event);
}

export function handleAuctionProceedsWithdrawn(_event: AuctionProceedsWithdrawn): void {}
