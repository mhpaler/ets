import { Creator } from "../generated/schema";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensureCreator(
  creatorAddress: string,
  event: ethereum.Event
): Creator {
  let creator = Creator.load(creatorAddress);

  if (creator === null) {
    creator = new Creator(creatorAddress);
    creator.firstSeen = event.block.timestamp;
    creator.mintCount = ZERO;
    creator.tagCount = ZERO;
    creator.tagFees = ZERO;
    creator.save();
  }
  return creator as Creator;
}
