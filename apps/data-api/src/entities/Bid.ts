import { BigInt as GraphBigInt } from "@graphprotocol/graph-ts";
import { AuctionBid } from "../generated/ETSAuctionHouse/ETSAuctionHouse";
import { Bid } from "../generated/schema";
import { logCritical } from "../utils/logCritical";
import { updateAuction } from "./Auction";
import { ensureOwner } from "./Owner";

export function ensureBid(auctionId: GraphBigInt, event: AuctionBid): void {
  //let auction = ensureAuction(auctionId, event);
  // Update and fetch the local auction object from blockchain.
  const auction = updateAuction(auctionId, event);

  if (auction == null) {
    logCritical("[handleAuctionBid] Auction not found for auction #{}. Hash: {}", [
      auctionId.toString(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const bidder = ensureOwner(event.params.sender, event);
  const bid = new Bid(event.transaction.hash.toHex());
  bid.bidder = bidder.id;
  bid.amount = auction.amount;
  bid.tag = auction.id;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.auction = auction.id;
  bid.save();
}
