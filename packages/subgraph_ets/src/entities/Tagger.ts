import { Tagger } from "../generated/schema";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

export const ZERO = BigInt.fromI32(0);

export function ensureTagger(
  taggerAddress: Address,
  event: ethereum.Event
): Tagger {
  let tagger = Tagger.load(taggerAddress.toHex()) as Tagger;

  if (tagger) {
    return tagger;
  }

  tagger = new Tagger(taggerAddress.toHex());
  tagger.firstSeen = event.block.timestamp;
  tagger.tagCount = ZERO;
  tagger.feesPaid = ZERO;
  tagger.save();

  return tagger;
}
