import { Publisher } from "../generated/schema";
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
const ZERO = BigInt.fromI32(0);

export function ensurePublisher(
  publisherAddress: Address,
  event: ethereum.Event
): Publisher {
  let publisher = Publisher.load(publisherAddress.toHex()) as Publisher;

  if (publisher) {
    return publisher;
  }

  publisher = new Publisher(publisherAddress.toHex());
  publisher.name = "poo";
  publisher.pausedByProtocol = true;
  publisher.firstSeen = event.block.timestamp;
  publisher.mintCount = ZERO;
  publisher.tagCount = ZERO;
  publisher.tagFees = ZERO;
  publisher.save();

  return publisher;
}
