import { Administrator } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensureAdministrator(
  administratorAddress: Address,
  event: ethereum.Event
): Administrator {
  let administrator = Administrator.load(
    administratorAddress.toHex()
  ) as Administrator;

  if (administrator) {
    return administrator;
  }

  administrator = new Administrator(administratorAddress.toHex());
  administrator.firstSeen = event.block.timestamp;
  administrator.save();

  return administrator;
}
