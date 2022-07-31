import { PublisherAdmin } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensurePublisherAdmin(
  publisherAdminAddress: Address,
  event: ethereum.Event
): PublisherAdmin {
  let publisherAdmin = PublisherAdmin.load(
    publisherAdminAddress.toHex()
  ) as PublisherAdmin;

  if (publisherAdmin) {
    return publisherAdmin;
  }

  publisherAdmin = new PublisherAdmin(publisherAdminAddress.toHex());
  publisherAdmin.firstSeen = event.block.timestamp;
  publisherAdmin.save();

  return publisherAdmin;
}
