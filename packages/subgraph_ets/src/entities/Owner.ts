import { Owner } from "../generated/schema";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensureOwner(
  ownerAddress: string,
  event: ethereum.Event
): Owner {
  let owner = Owner.load(ownerAddress);

  if (owner === null) {
    owner = new Owner(ownerAddress);
    owner.firstSeen = event.block.timestamp;
    owner.mintCount = ZERO;
    owner.tagCount = ZERO;
    owner.tagFees = ZERO;
    owner.save();
  }

  return owner;
}
