export type AccessControlsRead =
  | "hasRole"
  | "isAdmin"
  | "isAuctionOracle"
  | "isRelayer"
  | "isRelayerAdmin"
  | "isRelayerAndNotPaused"
  | "isRelayerByAddress"
  | "isRelayerByName"
  | "isRelayerByOwner"
  | "isRelayerFactory"
  | "isRelayerLocked"
  | "isSmartContract"
  | "getPlatformAddress"
  | "getRelayerAddressFromName"
  | "getRelayerAddressFromOwner"
  | "getRelayerNameFromAddress"
  | "getRoleAdmin"
  | "proxiableUUID"
  | "relayerContractToName"
  | "relayerLocked"
  | "relayerNameToContract"
  | "relayerOwnerToAddress"
  | "supportsInterface";

export type AccessControlsWrite =
  | "grantRole"
  | "revokeRole"
  | "changeRelayerOwner"
  | "initialize"
  | "renounceRole"
  | "pauseRelayerByOwnerAddress"
  | "registerRelayer"
  | "setPlatform"
  | "setRoleAdmin"
  | "toggleRelayerLock"
  | "upgradeTo"
  | "upgradeToAndCall";

export type AuctionHouseRead =
  | "accrued"
  | "auctionEnded"
  | "auctionExists"
  | "auctionExistsForTokenId"
  | "auctionSettled"
  | "auctions"
  | "auctionsByTokenId"
  | "creatorPercentage"
  | "duration"
  | "etsAccessControls"
  | "etsToken"
  | "maxAuctions"
  | "minBidIncrementPercentage"
  | "paid"
  | "paused"
  | "platformPercentage"
  | "proxiableUUID"
  | "relayerPercentage"
  | "reservePrice"
  | "timeBuffer"
  | "totalDue"
  | "getAuction"
  | "getActiveCount"
  | "getAuctionCountForTokenId"
  | "getAuctionForTokenId"
  | "getBalance"
  | "getTotalCount";

export type AuctionHouseWrite =
  | "createBid"
  | "createNextAuction"
  | "drawDown"
  | "fulfillRequestCreateAuction"
  | "pause"
  | "setDuration"
  | "setMaxAuctions"
  | "setMinBidIncrementPercentage"
  | "setProceedPercentages"
  | "setReservePrice"
  | "setTimeBuffer"
  | "settleAuction"
  | "settleCurrentAndCreateNewAuction"
  | "unpause"
  | "upgradeTo"
  | "upgradeToAndCall";

export type CoreWrite =
  | "applyTagsWithCompositeKey"
  | "appendTags"
  | "initialize"
  | "removeTags"
  | "replaceTags"
  | "setAccessControls"
  | "setPercentages"
  | "setTaggingFee"
  | "upgradeTo"
  | "upgradeToAndCall";

export type CoreRead =
  | "accrued"
  | "platformPercentage"
  | "relayerPercentage"
  | "taggingFee"
  | "taggingRecordExists"
  | "etsAccessControls"
  | "etsTarget"
  | "etsToken"
  | "totalDue"
  | "proxiableUUID";

export type EnrichTargetWrite =
  | "fulfillEnrichTarget"
  | "initialize"
  | "requestEnrichTarget"
  | "upgradeTo"
  | "upgradeToAndCall";

export type EnrichTargetRead = "etsAccessControls" | "etsTarget" | "proxiableUUID";

export type RelayerWrite =
  | "applyTags"
  | "changeOwner"
  | "initialize"
  | "pause"
  | "renounceOwnership"
  | "replaceTags"
  | "transferOwnership"
  | "unpause"
  | "removeTags";

export type RelayerRead =
  | "computeTaggingFee"
  | "creator"
  | "ets"
  | "etsAccessControls"
  | "etsTarget"
  | "etsToken"
  | "getBalance"
  | "owner"
  | "getRelayerName"
  | "paused"
  | "supportsInterface"
  | "version";

export type RelayerFactoryWrite = "addRelayer";

export type RelayerFactoryRead =
  | "getImplementation"
  | "ets"
  | "etsAccessControls"
  | "etsTarget"
  | "etsToken"
  | "getBeacon";

export type TargetWrite =
  | "createTarget"
  | "setAccessControls"
  | "setEnrichTarget"
  | "updateTarget"
  | "upgradeTo"
  | "upgradeToAndCall"
  | "initialize";

export type TargetRead =
  | "getTargetById"
  | "getTargetByURI"
  | "targetExistsById"
  | "targetExistsByURI"
  | "getOrCreateTargetId"
  | "getName"
  | "proxiableUUID"
  | "targets"
  | "computeTargetId"
  | "etsAccessControls"
  | "etsEnrichTarget";

export type TokenWrite =
  | "approve"
  | "burn"
  | "getOrCreateTagId"
  | "setETSCore"
  | "setOwnershipTermLength"
  | "setTagMaxStringLength"
  | "setTagMinStringLength"
  | "upgradeTo"
  | "upgradeToAndCall"
  | "setApprovalForAll"
  | "transferFrom"
  | "pause"
  | "unPause"
  | "initialize"
  | "preSetPremiumTags"
  | "recycleTag"
  | "renewTag"
  | "safeTransferFrom"
  | "setAccessControls"
  | "setPremiumFlag"
  | "setReservedFlag";

export type TokenRead =
  | "existingTags"
  | "hasTags"
  | "tagExistsById"
  | "computeTagId"
  | "computeTagIds"
  | "approve"
  | "balanceOf"
  | "getApproved"
  | "getTagById"
  | "getTagByString"
  | "isApprovedForAll"
  | "ownerOf"
  | "getOwnershipTermLength"
  | "tagOwnershipTermExpired"
  | "tagMaxStringLength"
  | "tagMinStringLength"
  | "supportsInterface"
  | "symbol"
  | "getOrCreateTagId";
