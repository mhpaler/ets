import { TargetTagger } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensureTargetTagger(
  address: Address,
  event: ethereum.Event
): TargetTagger {
  let targetTagger = TargetTagger.load(address.toHexString());

  if (targetTagger === null) {
    targetTagger = new TargetTagger(address.toHexString());
    targetTagger.firstSeen = event.block.timestamp;
    targetTagger.save();
  }
  return targetTagger as TargetTagger;
}
