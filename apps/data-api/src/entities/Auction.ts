import { BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { ETSAuctionHouse } from "../generated/ETSAuctionHouse/ETSAuctionHouse";
import { Auction } from "../generated/schema";

import { ZERO } from "../utils/constants";
import { logCritical } from "../utils/logCritical";
import { ensureOwner } from "./Owner";
import { ensureTag } from "./Tag";

export function ensureAuction(auctionId: GraphBigInt, event: ethereum.Event): Auction {
  let auction = Auction.load(auctionId.toString());

  if (auction === null && event) {
    const contract = ETSAuctionHouse.bind(event.address);
    const auctionCall = contract.try_getAuction(auctionId);

    if (auctionCall.reverted) {
      logCritical("getAuction reverted for {}", [auctionId.toString()]);
    }

    auction = new Auction(auctionId.toString());
    auction.tag = ensureTag(auctionCall.value.tokenId, event).id;

    const tokenAuctionNumberCall = contract.try_getAuctionCountForTokenId(auctionCall.value.tokenId);
    if (tokenAuctionNumberCall.reverted) {
      logCritical("getAuctionCountForTokenId reverted for {}", [auctionCall.value.tokenId.toString()]);
    }

    auction.tokenAuctionNumber = tokenAuctionNumberCall.value;
    auction.bidder = ensureOwner(auctionCall.value.bidder, event).id; //auctionCall.value.bidder.toHexString();
    auction.reservePrice = auctionCall.value.reservePrice; // set once at beginning of auction
    auction.amount = ZERO;
    auction.startTime = auctionCall.value.startTime;
    auction.endTime = auctionCall.value.endTime;
    auction.extended = false;
    auction.settled = false;
    auction.save();
  }
  return auction as Auction;
}

export function updateAuction(auctionId: GraphBigInt, event: ethereum.Event): Auction {
  const auction = ensureAuction(auctionId, event);
  if (auction && event) {
    const contract = ETSAuctionHouse.bind(event.address);
    const auctionCall = contract.try_getAuction(auctionId);
    if (auctionCall.reverted) {
      logCritical("getAuction reverted for {}", [auctionId.toString()]);
    }

    auction.bidder = ensureOwner(auctionCall.value.bidder, event).id;
    auction.amount = auctionCall.value.amount;
    auction.startTime = auctionCall.value.startTime;
    auction.endTime = auctionCall.value.endTime;
    auction.settled = auctionCall.value.settled;
    auction.save();
  }
  return auction as Auction;
}

export function extendAuction(auctionId: GraphBigInt, event: ethereum.Event): Auction {
  const auction = ensureAuction(auctionId, event);
  if (auction && event) {
    const contract = ETSAuctionHouse.bind(event.address);
    const auctionCall = contract.try_getAuction(auctionId);
    if (auctionCall.reverted) {
      logCritical("getAuction reverted for {}", [auctionId.toString()]);
    }

    auction.endTime = auctionCall.value.endTime;
    auction.extended = true;
    auction.save();
  }
  return auction as Auction;
}
