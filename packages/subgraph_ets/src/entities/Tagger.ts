import { Tagger } from "../generated/schema";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensureTagger(
  taggerAddress: string,
  event: ethereum.Event
): Tagger | null {
  let tagger = Tagger.load(taggerAddress);

  if (tagger === null) {
    tagger = new Tagger(taggerAddress);
    tagger.firstSeen = event.block.timestamp;
    tagger.tagCount = ZERO;
    tagger.feesPaid = ZERO;
    tagger.tags = [];
    tagger.save();
  }

  return tagger as Tagger;
}
