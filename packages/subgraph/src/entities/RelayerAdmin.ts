import { RelayerAdmin } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensureRelayerAdmin(address: Address, event: ethereum.Event): RelayerAdmin {
  let relayerAdmin = RelayerAdmin.load(address.toHex());

  if (relayerAdmin === null) {
    relayerAdmin = new RelayerAdmin(address.toHex());
    relayerAdmin.firstSeen = event.block.timestamp;
    relayerAdmin.save();
  }

  return relayerAdmin as RelayerAdmin;
}
