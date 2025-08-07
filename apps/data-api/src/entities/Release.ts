import { Release } from "../generated/schema";
import { ZERO } from "../utils/helpers";

export function ensureRelease(): Release {
  let release = Release.load("ETSRelease");
  if (release === null) {
    release = new Release("ETSRelease");
    // Contract versions
    release.ets = ZERO.toString();
    release.etsVersion = ZERO;
    release.etsVersionDate = ZERO;

    release.etsAccessControls = ZERO.toString();
    release.etsAccessControlsVersion = ZERO;
    release.etsAccessControlsVersionDate = ZERO;

    release.etsToken = ZERO.toString();
    release.etsTokenVersion = ZERO;
    release.etsTokenVersionDate = ZERO;

    release.etsTarget = ZERO.toString();
    release.etsTargetVersion = ZERO;
    release.etsTargetVersionDate = ZERO;

    release.etsAuctionHouse = ZERO.toString();
    release.etsAuctionHouseVersion = ZERO;
    release.etsAuctionHouseVersionDate = ZERO;

    release.save();
  }

  return release as Release;
}
