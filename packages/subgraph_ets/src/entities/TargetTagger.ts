import { TargetTagger } from "../generated/schema";
import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensureTargetTagger(
  targetTaggerAddress: Address,
  event: ethereum.Event
): TargetTagger {
  let targetTagger = TargetTagger.load(
    targetTaggerAddress.toHex()
  ) as TargetTagger;

  if (targetTagger) {
    return targetTagger;
  }

  targetTagger = new TargetTagger(targetTaggerAddress.toHex());
  targetTagger.firstSeen = event.block.timestamp;
  targetTagger.save();

  return targetTagger;
}
