import { Address, ethereum } from "@graphprotocol/graph-ts";
import { ChannelAdmin } from "../generated/schema";

export function ensureChannelAdmin(address: Address, event: ethereum.Event): ChannelAdmin {
  let channelAdmin = ChannelAdmin.load(address.toHex());

  if (channelAdmin === null) {
    channelAdmin = new ChannelAdmin(address.toHex());
    channelAdmin.firstSeen = event.block.timestamp;
    channelAdmin.save();
  }

  return channelAdmin as ChannelAdmin;
}
