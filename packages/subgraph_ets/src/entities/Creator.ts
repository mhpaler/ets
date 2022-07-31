import { Creator } from "../generated/schema";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensureCreator(
  creatorAddress: Address,
  event: ethereum.Event
): Creator {
  let creator = Creator.load(creatorAddress.toHex()) as Creator;

  if (creator) {
    return creator;
  }

  creator = new Creator(creatorAddress.toHex());
  creator.firstSeen = event.block.timestamp;
  creator.mintCount = ZERO;
  creator.tagCount = ZERO;
  creator.tagFees = ZERO;
  creator.save();

  return creator;
}
