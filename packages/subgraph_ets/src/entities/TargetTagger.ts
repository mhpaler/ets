import { TargetTagger } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensureTargetTagger(
  address: string,
  event: ethereum.Event
): TargetTagger {
  let targetTagger = TargetTagger.load(address);

  if (targetTagger === null) {
    targetTagger = new TargetTagger(address);
    targetTagger.firstSeen = event.block.timestamp;
    targetTagger.save();
  }
  return targetTagger as TargetTagger;
}
