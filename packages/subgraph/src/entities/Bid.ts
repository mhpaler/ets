import { BigInt } from "@graphprotocol/graph-ts";
import { Bid } from "../generated/schema";
import { AuctionBid } from "../generated/ETSAuctionHouse/ETSAuctionHouse";
import { ensureOwner } from "./Owner";
import { updateAuction } from "./Auction";
import { logCritical } from "../utils/logCritical";

export function ensureBid(auctionId: BigInt, event: AuctionBid): void {
  //let auction = ensureAuction(auctionId, event);
  // Update and fetch the local auction object from blockchain.
  let auction = updateAuction(auctionId, event);

  if (auction == null) {
    logCritical("[handleAuctionBid] Auction not found for Noun #{}. Hash: {}", [
      auctionId.toString(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  let bidder = ensureOwner(event.params.sender, event);
  let bid = new Bid(event.transaction.hash.toHex());
  bid.bidder = bidder.id;
  bid.amount = auction.amount;
  bid.tag = auction.id;
  bid.txIndex = event.transaction.index;
  bid.blockNumber = event.block.number;
  bid.blockTimestamp = event.block.timestamp;
  bid.auction = auction.id;
  bid.save();
}
