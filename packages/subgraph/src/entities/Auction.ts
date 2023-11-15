import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Auction } from "../generated/schema";
import { ETSAuctionHouse } from "../generated/ETSAuctionHouse/ETSAuctionHouse";

import { ensureTag } from "./Tag";
import { ensureOwner } from "./Owner";
import { ZERO } from "../utils/constants";

import { logCritical } from "../utils/logCritical";

export function ensureAuction(auctionId: BigInt, event: ethereum.Event): Auction {
  let auction = Auction.load(auctionId.toString());

  if (auction === null && event) {
    let contract = ETSAuctionHouse.bind(event.address);
    let auctionCall = contract.try_getAuction(auctionId);

    if (auctionCall.reverted) {
      logCritical("getTaggingRecordFromId reverted for {}", [auctionId.toString()]);
    }

    auction = new Auction(auctionId.toString());
    auction.auctionNumber = auctionCall.value.auctionId;
    auction.tag = ensureTag(auctionId, event).id; // id of auction is same as id of tag being auctioned
    auction.bidder = ensureOwner(auctionCall.value.bidder, event).id; //auctionCall.value.bidder.toHexString();
    auction.amount = ZERO;
    auction.startTime = auctionCall.value.startTime;
    auction.endTime = auctionCall.value.endTime;
    auction.settled = false;
    auction.save();
  }
  return auction as Auction;
}

export function updateAuction(auctionId: BigInt, event: ethereum.Event): Auction {
  let auction = ensureAuction(auctionId, event);
  if (auction && event) {
    let contract = ETSAuctionHouse.bind(event.address);
    let auctionCall = contract.try_getAuction(auctionId);
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
