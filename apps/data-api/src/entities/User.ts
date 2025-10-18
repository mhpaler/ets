import { Address, BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";
import { arrayDiff } from "../utils/arrayDiff";
import { APPEND, CREATE, ONE, REMOVE, ZERO } from "../utils/constants";
import { ensureGlobalSettings } from "./GlobalSettings";
import { ensurePlatform } from "./Platform";

/**
 * Ensures a User entity exists for the given address.
 * Creates a new User if one doesn't exist.
 */
export function ensureUser(userAddress: Address, event: ethereum.Event): User {
  let user = User.load(userAddress.toHex());

  if (user === null && event) {
    user = new User(userAddress.toHex());
    user.firstSeen = event.block.timestamp;
    user.lastActive = event.block.timestamp;

    // Initialize role flags
    user.isCreator = false;
    user.isTagger = false;
    user.isChannelOwner = false;
    user.isAdministrator = false;
    user.isChannelAdmin = false;

    // Initialize creation statistics
    user.tagsCreated = ZERO;
    user.createdTagsAddedToTaggingRecords = ZERO;
    user.createdTagsRemovedFromTaggingRecords = ZERO;
    user.createdTagsTaggingFeeRevenue = ZERO;

    // Initialize tagging statistics
    user.taggingRecordsCreated = ZERO;
    user.taggingRecordTxns = ZERO;
    user.tagsApplied = ZERO;
    user.tagsRemoved = ZERO;
    user.feesPaid = ZERO;

    // Initialize channel statistics
    user.channelsOwned = ZERO;
    user.channelsCreated = ZERO;

    // Initialize relationships
    user.usedTags = [];

    user.save();

    // Update platform statistics for new user
    updateUserCountOnPlatform(event);
  } else if (user && event) {
    // Update last activity timestamp
    user.lastActive = event.block.timestamp;
    user.save();
  }

  return user as User;
}

/**
 * Updates the user count on the platform entity.
 * This is called when a new user is created.
 */
function updateUserCountOnPlatform(event: ethereum.Event): void {
  const platform = ensurePlatform(event);
  // Platform doesn't have a userCount field yet, but this is where it would be updated
  // platform.userCount = platform.userCount.plus(ONE);
  platform.save();
}

/**
 * Updates user statistics when they create a TAG.
 */
export function updateUserTagCreation(userAddress: Address, event: ethereum.Event): void {
  const user = ensureUser(userAddress, event);

  // Update role flag
  if (!user.isCreator) {
    user.isCreator = true;
  }

  // Update statistics
  user.tagsCreated = user.tagsCreated.plus(ONE);
  user.save();
}

/**
 * Updates user statistics for tagging record operations.
 */
export function updateUserTaggingRecordStats(
  userAddress: Address,
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: GraphBigInt,
  event: ethereum.Event,
): void {
  const user = ensureUser(userAddress, event);

  // Update role flag
  if (!user.isTagger) {
    user.isTagger = true;
  }

  // Log the transaction regardless of action
  user.taggingRecordTxns = user.taggingRecordTxns.plus(ONE);

  if (action === CREATE && newTagIds) {
    user.taggingRecordsCreated = user.taggingRecordsCreated.plus(ONE);
  }

  if (user.usedTags && newTagIds && previousTagIds) {
    const settings = ensureGlobalSettings();

    if (action === CREATE) {
      user.usedTags = user.usedTags.concat(newTagIds);
      user.tagsApplied = user.tagsApplied.plus(GraphBigInt.fromI32(newTagIds.length));
      user.feesPaid = user.feesPaid.plus(GraphBigInt.fromI32(newTagIds.length).times(settings.taggingFee));
    }

    if (action === APPEND) {
      // newTags - previousTags
      const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      user.usedTags = user.usedTags.concat(appendedTagIds);
      user.tagsApplied = user.tagsApplied.plus(GraphBigInt.fromI32(appendedTagIds.length));
      user.feesPaid = user.feesPaid.plus(GraphBigInt.fromI32(appendedTagIds.length).times(settings.taggingFee));
    }

    if (action === REMOVE) {
      const removedTagIds = arrayDiff(previousTagIds, newTagIds);
      user.usedTags = arrayDiff(user.usedTags, removedTagIds);
      user.tagsRemoved = user.tagsRemoved.plus(GraphBigInt.fromI32(removedTagIds.length));
    }
  }

  user.save();
}

/**
 * Updates user revenue statistics when their created tags are used.
 */
export function updateUserTagRevenue(
  userAddress: Address,
  creatorFee: GraphBigInt,
  isAdded: boolean,
  event: ethereum.Event,
): void {
  const user = ensureUser(userAddress, event);

  if (isAdded) {
    user.createdTagsAddedToTaggingRecords = user.createdTagsAddedToTaggingRecords.plus(ONE);
    user.createdTagsTaggingFeeRevenue = user.createdTagsTaggingFeeRevenue.plus(creatorFee);
  } else {
    user.createdTagsRemovedFromTaggingRecords = user.createdTagsRemovedFromTaggingRecords.plus(ONE);
  }

  user.save();
}

/**
 * Updates user statistics when they own a channel.
 */
export function updateUserChannelOwnership(
  ownerAddress: Address,
  creatorAddress: Address,
  event: ethereum.Event,
): void {
  // Update owner
  const owner = ensureUser(ownerAddress, event);
  if (!owner.isChannelOwner) {
    owner.isChannelOwner = true;
  }
  owner.channelsOwned = owner.channelsOwned.plus(ONE);
  owner.save();

  // Update creator (may be same as owner)
  const creator = ensureUser(creatorAddress, event);
  creator.channelsCreated = creator.channelsCreated.plus(ONE);
  creator.save();
}

/**
 * Updates user administrator role.
 */
export function updateUserAdministratorRole(userAddress: Address, event: ethereum.Event): void {
  const user = ensureUser(userAddress, event);

  if (!user.isAdministrator) {
    user.isAdministrator = true;
    user.save();
  }
}

/**
 * Updates user channel admin role.
 */
export function updateUserChannelAdminRole(userAddress: Address, event: ethereum.Event): void {
  const user = ensureUser(userAddress, event);

  if (!user.isChannelAdmin) {
    user.isChannelAdmin = true;
    user.save();
  }
}
