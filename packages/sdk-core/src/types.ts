export type AccessControlsReadFunction =
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

export type AccessControlsWriteFunction =
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

export type AuctionHouseReadFunction =
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

export type AuctionHouseWriteFunction =
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

export type EtsWriteFunction =
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

export type EtsReadFunction =
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

export type EnrichTargetWriteFunction =
  | "fulfillEnrichTarget"
  | "initialize"
  | "requestEnrichTarget"
  | "upgradeTo"
  | "upgradeToAndCall";

export type EnrichTargetReadFunction = "etsAccessControls" | "etsTarget" | "proxiableUUID";

export type RelayerWriteFunction =
  | "applyTags"
  | "changeOwner"
  | "initialize"
  | "pause"
  | "renounceOwnership"
  | "replaceTags"
  | "transferOwnership"
  | "unpause"
  | "removeTags";

export type RelayerReadFunction =
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

export type RelayerFactoryWriteFunction = "addRelayer";

export type RelayerFactoryReadFunction =
  | "getImplementation"
  | "ets"
  | "etsAccessControls"
  | "etsTarget"
  | "etsToken"
  | "getBeacon";

export type TargetWriteFunction =
  | "createTarget"
  | "setAccessControls"
  | "setEnrichTarget"
  | "updateTarget"
  | "upgradeTo"
  | "upgradeToAndCall"
  | "initialize";

export type TargetReadFunction =
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

export type TokenWriteFunction =
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

export type TokenReadFunction =
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
