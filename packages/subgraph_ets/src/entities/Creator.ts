import { Creator } from "../generated/schema";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensureCreator(
  creatorAddress: Address,
  event: ethereum.Event
): Creator | null {
  let creator = Creator.load(creatorAddress.toHexString()) as Creator;

  if (creator) {
    return creator;
  }

  creator = new Creator(creatorAddress.toHexString());
  creator.firstSeen = event.block.timestamp;
  creator.mintCount = ZERO;
  creator.tagCount = ZERO;
  creator.tagFees = ZERO;
  creator.save();

  return creator;
}
