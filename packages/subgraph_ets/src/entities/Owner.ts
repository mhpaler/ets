import { Owner } from "../generated/schema";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensureOwner(
  ownerAddress: Address,
  event: ethereum.Event
): Owner {
  let owner = Owner.load(ownerAddress.toHex()) as Owner;

  if (owner) {
    return owner;
  }

  owner = new Owner(ownerAddress.toHex());
  owner.firstSeen = event.block.timestamp;
  owner.mintCount = ZERO;
  owner.tagCount = ZERO;
  owner.tagFees = ZERO;
  owner.save();

  return owner;
}
