import type { BigInt as GraphBigInt } from "@graphprotocol/graph-ts";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { MODULO, OWNER, PLATFORM, RELAYER, ZERO } from "../utils/constants";

export function getTaggingFee(actor: GraphBigInt): GraphBigInt {
  const settings = ensureGlobalSettings();
  const modulo = MODULO;
  const tagFee = settings.taggingFee;

  if (tagFee > ZERO) {
    const platformPercentageTaggingFee = settings.taggingFeePlatformPercentage;
    const relayerPercentageTaggingFee = settings.taggingFeeRelayerPercentage;
    const remainingPercentageTaggingFee = modulo.minus(platformPercentageTaggingFee).minus(relayerPercentageTaggingFee);

    if (actor === PLATFORM) {
      return tagFee.times(platformPercentageTaggingFee).div(modulo);
    }

    if (actor === RELAYER) {
      return tagFee.times(relayerPercentageTaggingFee).div(modulo);
    }

    if (actor === OWNER) {
      return tagFee.times(remainingPercentageTaggingFee).div(modulo);
    }
  }
  return ZERO;
}
