import { Platform } from "../generated/schema";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensurePlatform(
  platformAddress: Address,
  event: ethereum.Event
): Platform {
  let platform = Platform.load(platformAddress.toHex()) as Platform;

  if (platform) {
    return platform;
  }

  platform = new Platform(platformAddress.toHex());
  platform.firstSeen = event.block.timestamp;
  platform.tagFees = ZERO;
  platform.save();

  return platform;
}
