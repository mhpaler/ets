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
  | "relayerContractToName"
  | "relayerLocked"
  | "relayerNameToContract"
  | "relayerOwnerToAddress"
  | "supportsInterface";

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
  | "settleAuction"
  | "settleCurrentAndCreateNewAuction";

export type EtsWriteFunction =
  | "applyTagsWithRawInput"
  | "applyTagsWithCompositeKey"
  | "appendTags"
  | "removeTags"
  | "replaceTags";

export type EtsReadFunction =
  | "accrued"
  | "platformPercentage"
  | "relayerPercentage"
  | "taggingFee"
  | "taggingRecordExists"
  | "etsAccessControls"
  | "etsTarget"
  | "etsToken"
  | "totalDue";

export type EnrichTargetWriteFunction = "fulfillEnrichTarget" | "requestEnrichTarget";

export type EnrichTargetReadFunction = "etsAccessControls" | "etsTarget";

export type RelayerWriteFunction =
  | "applyTags"
  | "changeOwner"
  | "pause"
  | "renounceOwnership"
  | "replaceTags"
  | "transferOwnership"
  | "unpause"
  | "removeTags"
  | "getOrCreateTags";

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

export type RelayerFactoryReadFunction = "ets" | "etsAccessControls" | "etsTarget" | "etsToken";

export type TargetWriteFunction = "createTarget" | "updateTarget" | "getOrCreateTargetId";

export type TargetReadFunction =
  | "getTargetById"
  | "getTargetByURI"
  | "targetExistsById"
  | "targetExistsByURI"
  | "getName"
  | "targets"
  | "computeTargetId"
  | "etsAccessControls"
  | "etsEnrichTarget";

export type TokenWriteFunction = "getOrCreateTagId" | "transferFrom" | "recycleTag" | "renewTag" | "safeTransferFrom";

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
