import { GlobalSettings } from "../generated/schema";
import { ZERO } from "../utils/helpers";

export function ensureGlobalSettings(): GlobalSettings {
  let settings = GlobalSettings.load("globalSettings");

  if (settings === null) {
    settings = new GlobalSettings("globalSettings");
    // Tags
    settings.tagMinStringLength = ZERO;
    settings.tagMaxStringLength = ZERO;

    // Tagging
    settings.taggingFee = ZERO;
    settings.taggingFeePlatformPercentage = ZERO;
    settings.taggingFeeChannelPercentage = ZERO;

    settings.save();
  }

  return settings as GlobalSettings;
}
