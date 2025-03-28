import { GlobalSettings } from "../generated/schema";
import { ZERO } from "../utils/helpers";

export function ensureGlobalSettings(): GlobalSettings {
  let settings = GlobalSettings.load("globalSettings");

  if (settings === null) {
    settings = new GlobalSettings("globalSettings");
    // Tags
    settings.tagMinStringLength = ZERO;
    settings.tagMaxStringLength = ZERO;
    settings.ownershipTermLength = ZERO;

    // Tagging
    settings.taggingFee = ZERO;
    settings.taggingFeePlatformPercentage = ZERO;
    settings.taggingFeeRelayerPercentage = ZERO;

    // Auction
    settings.maxAuctions = ZERO;
    settings.minIncrementBidPercentage = ZERO;
    settings.duration = ZERO;
    settings.reservePrice = ZERO;
    settings.timeBuffer = ZERO;
    settings.relayerPercentage = ZERO;
    settings.creatorPercentage = ZERO;
    settings.platformPercentage = ZERO;

    settings.save();
  }

  return settings as GlobalSettings;
}
