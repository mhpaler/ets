import { Platform } from "../generated/schema";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensurePlatform(
  address: string,
  event: ethereum.Event
): Platform {
  let platform = Platform.load(address);
  if (platform === null) {
    platform = new Platform(address);
    platform.firstSeen = event.block.timestamp;
    platform.tagFees = ZERO;
    platform.save();
  }
  return platform as Platform;
}
