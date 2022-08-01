import { Administrator } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensureAdministrator(
  address: Address,
  event: ethereum.Event
): Administrator {
  let administrator = Administrator.load(address.toHexString());

  if (administrator === null) {
    administrator = new Administrator(address.toHexString());
    administrator.firstSeen = event.block.timestamp;
    administrator.save();
  }

  return administrator as Administrator;
}
