import { BigInt } from "@graphprotocol/graph-ts";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ZERO, MODULO, PLATFORM, RELAYER, OWNER } from "../utils/constants";

export function getTaggingFee(actor: BigInt): BigInt {
  let settings = ensureGlobalSettings();
  let modulo = MODULO;
  let tagFee = settings.taggingFee;

  if (tagFee > ZERO) {
    let platformPercentageTaggingFee = settings.taggingFeePlatformPercentage;
    let relayerPercentageTaggingFee = settings.taggingFeeRelayerPercentage;
    let remainingPercentageTaggingFee = modulo.minus(platformPercentageTaggingFee).minus(relayerPercentageTaggingFee);

    if (actor == PLATFORM) {
      return tagFee.times(platformPercentageTaggingFee).div(modulo);
    }

    if (actor == RELAYER) {
      return tagFee.times(relayerPercentageTaggingFee).div(modulo);
    }

    if (actor == OWNER) {
      return tagFee.times(remainingPercentageTaggingFee).div(modulo);
    }
  }
  return ZERO;
}
