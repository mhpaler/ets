import { Administrator } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensureAdministrator(
  address: string,
  event: ethereum.Event
): Administrator {
  let administrator = Administrator.load(address);

  if (administrator === null) {
    administrator = new Administrator(address);
    administrator.firstSeen = event.block.timestamp;
    administrator.save();
  }

  return administrator as Administrator;
}
