import { BigInt as GraphBigInt } from "@graphprotocol/graph-ts";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { CHANNEL, MODULO, OWNER, PLATFORM, ZERO } from "../utils/constants";

export function getTaggingFee(actor: GraphBigInt): GraphBigInt {
  const settings = ensureGlobalSettings();
  const modulo = MODULO;
  const tagFee = settings.taggingFee;

  if (tagFee > ZERO) {
    const platformPercentageTaggingFee = settings.taggingFeePlatformPercentage;
    const channelPercentageTaggingFee = settings.taggingFeeChannelPercentage;
    const remainingPercentageTaggingFee = modulo.minus(platformPercentageTaggingFee).minus(channelPercentageTaggingFee);

    if (actor === PLATFORM) {
      return tagFee.times(platformPercentageTaggingFee).div(modulo);
    }

    if (actor === CHANNEL) {
      return tagFee.times(channelPercentageTaggingFee).div(modulo);
    }

    if (actor === OWNER) {
      return tagFee.times(remainingPercentageTaggingFee).div(modulo);
    }
  }
  return ZERO;
}
