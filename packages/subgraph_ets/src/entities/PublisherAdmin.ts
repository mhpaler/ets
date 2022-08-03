import { PublisherAdmin } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensurePublisherAdmin(
  address: string,
  event: ethereum.Event
): PublisherAdmin {
  let publisherAdmin = PublisherAdmin.load(address);

  if (publisherAdmin === null) {
    publisherAdmin = new PublisherAdmin(address);
    publisherAdmin.firstSeen = event.block.timestamp;
    publisherAdmin.save();
  }

  return publisherAdmin as PublisherAdmin;
}
