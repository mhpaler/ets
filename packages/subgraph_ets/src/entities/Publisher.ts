import { Publisher } from "../generated/schema";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensurePublisher(
  address: Address,
  event: ethereum.Event
): Publisher {
  let publisher = Publisher.load(address.toHexString());

  if (publisher === null) {
    publisher = new Publisher(address.toHexString());
    publisher.firstSeen = event.block.timestamp;
    publisher.mintCount = ZERO;
    publisher.tagCount = ZERO;
    publisher.tagFees = ZERO;
    publisher.save();
  }

  return publisher as Publisher;
}
