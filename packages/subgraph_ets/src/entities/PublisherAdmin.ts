import { PublisherAdmin } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensurePublisherAdmin(
  address: Address,
  event: ethereum.Event
): PublisherAdmin {
  let publisherAdmin = PublisherAdmin.load(address.toHexString());

  if (publisherAdmin === null) {
    publisherAdmin = new PublisherAdmin(address.toHexString());
    publisherAdmin.firstSeen = event.block.timestamp;
    publisherAdmin.save();
  }

  return publisherAdmin as PublisherAdmin;
}
