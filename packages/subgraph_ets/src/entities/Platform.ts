import { Platform } from "../generated/schema";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensurePlatform(
  address: Address,
  event: ethereum.Event
): Platform {
  let platform = Platform.load(address.toHex());
  if (platform === null) {
    platform = new Platform(address.toHex());
    platform.firstSeen = event.block.timestamp;
    platform.tagFees = ZERO;
    platform.save();
  }
  return platform as Platform;
}
