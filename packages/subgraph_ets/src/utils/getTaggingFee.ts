import { BigInt } from "@graphprotocol/graph-ts";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ZERO, MODULO, PLATFORM, PUBLISHER, OWNER } from "../utils/constants";

export function getTaggingFee(actor: BigInt): BigInt {
  let settings = ensureGlobalSettings();
  let modulo = MODULO;
  let tagFee = settings.taggingFee;

  if (tagFee > ZERO) {
    let platformPercentageTaggingFee = settings.taggingFeePlatformPercentage;
    let publisherPercentageTaggingFee = settings.taggingFeePublisherPercentage;
    let remainingPercentageTaggingFee = modulo.minus(platformPercentageTaggingFee).minus(publisherPercentageTaggingFee);

    if (actor == PLATFORM) {
      return tagFee.times(platformPercentageTaggingFee).div(modulo);
    }

    if (actor == PUBLISHER) {
      return tagFee.times(publisherPercentageTaggingFee).div(modulo);
    }

    if (actor == OWNER) {
      return tagFee.times(remainingPercentageTaggingFee).div(modulo);
    }
  }
  return ZERO;
}
