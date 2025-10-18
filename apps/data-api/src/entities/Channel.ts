import { Address, BigInt as GraphBigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { ensureGlobalSettings } from "../entities/GlobalSettings";
import { ensureTag } from "../entities/Tag";
import { ensureUser, updateUserChannelOwnership } from "../entities/User";
import { ETSAccessControls } from "../generated/ETSAccessControls/ETSAccessControls";
import { TagCreated } from "../generated/ETSToken/ETSToken";
import { Channel, Release, Tag, User } from "../generated/schema";
import { ETSChannel } from "../generated/templates/ETSChannel/ETSChannel";
import { arrayDiff } from "../utils/arrayDiff";
import { APPEND, CHANNEL, CREATE, REMOVE, ZERO, ZERO_ADDRESS } from "../utils/constants";
import { getTaggingFee } from "../utils/getTaggingFee";
import { logCritical } from "../utils/logCritical";

export function ensureChannel(channelAddress: Address, event: ethereum.Event): Channel {
  let channel = Channel.load(channelAddress.toHex());
  const release = Release.load("ETSRelease");

  if (channel === null && release && event) {
    const contract = ETSAccessControls.bind(Address.fromString(release.etsAccessControls));
    const contractToNameCall = contract.try_channelContractToName(channelAddress);
    if (contractToNameCall.reverted) {
      logCritical("channelContractToName reverted for {}", [channelAddress.toString()]);
    }
    const isChannelAdminCall = contract.try_isChannelAdmin(channelAddress);
    if (isChannelAdminCall.reverted) {
      logCritical("isChannelAdminCall reverted for {}", [channelAddress.toString()]);
    }
    const isChannelLocked = contract.try_isChannelLocked(channelAddress);
    if (isChannelLocked.reverted) {
      logCritical("isChannelLocked reverted for {}", [channelAddress.toString()]);
    }

    let owner: string = channelAddress.toHex();
    let creator: string = channelAddress.toHex();
    let isPausedByOwner = false;

    if (isChannelAdminCall.value === false) {
      // This is a ChannelFactory contract. Let's fetch some onchain values.
      const channelContract = ETSChannel.bind(channelAddress);
      const getOwnerCall = channelContract.try_getOwner();
      if (getOwnerCall.reverted) {
        logCritical("getOwnerCall reverted for {}", [channelAddress.toString()]);
      } else {
        owner = getOwnerCall.value.toHex();
      }

      const getCreatorCall = channelContract.try_getCreator();
      if (getCreatorCall.reverted) {
        logCritical("getCreatorCall reverted for {}", [channelAddress.toString()]);
      } else {
        creator = getCreatorCall.value.toHex();
      }
      const isPausedByOwnerCall = channelContract.try_isPaused();
      if (isPausedByOwnerCall.reverted) {
        logCritical("isPausedByOwnerCall reverted for {}", [channelAddress.toString()]);
      } else {
        isPausedByOwner = isPausedByOwnerCall.value;
      }
    }

    channel = new Channel(channelAddress.toHex());
    channel.name = contractToNameCall.value;
    channel.admin = isChannelAdminCall.value;
    channel.lockedByProtocol = isChannelLocked.value;
    channel.owner = owner;
    channel.creator = creator;
    channel.pausedByOwner = isPausedByOwner;
    channel.firstSeen = event.block.timestamp;
    channel.tagsPublished = ZERO;
    channel.tagsApplied = ZERO;
    channel.tagsRemoved = ZERO;
    channel.taggingRecordsPublished = ZERO;
    channel.taggingRecordTxns = ZERO;
    channel.publishedTagsAddedToTaggingRecords = ZERO;
    channel.publishedTagsRemovedFromTaggingRecords = ZERO;
    channel.publishedTagsTaggingFeeRevenue = ZERO;

    // Ensure User entities exist for owner and creator
    const ownerUser = ensureUser(Address.fromString(owner), event);
    channel.ownerUser = ownerUser.id; // Reference to User entity

    const creatorUser = ensureUser(Address.fromString(creator), event);
    channel.creatorUser = creatorUser.id; // Reference to User entity

    // Update User channel ownership statistics
    updateUserChannelOwnership(Address.fromString(owner), Address.fromString(creator), event);

    channel.save();
  }

  return channel as Channel;
}

export function updateChannelTagStats(channelAddress: Address, event: TagCreated): void {
  const channel = ensureChannel(channelAddress, event);

  if (channel) {
    channel.tagsPublished = channel.tagsPublished.plus(GraphBigInt.fromI32(1));
    channel.save();
  }
}

function updateChannelRevenue(channel: Channel, tag: Tag, channelFee: GraphBigInt): void {
  channel.taggingRecordTxns = channel.taggingRecordTxns.plus(GraphBigInt.fromI32(1));

  const channelBytes = Address.fromString(channel.id);
  const tagChannelBytes = Address.fromString(tag.channel);

  if (channelBytes.equals(tagChannelBytes)) {
    channel.publishedTagsAddedToTaggingRecords = channel.publishedTagsAddedToTaggingRecords.plus(
      GraphBigInt.fromI32(1),
    );
    channel.publishedTagsTaggingFeeRevenue = channel.publishedTagsTaggingFeeRevenue.plus(channelFee);
  }
  channel.save();
}

export function updateChannelTaggingRecordStats(
  channelAddress: Address,
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: GraphBigInt,
  event: ethereum.Event,
): void {
  if (!newTagIds || !previousTagIds) return;

  const channel = ensureChannel(channelAddress, event);
  const channelFee = getTaggingFee(CHANNEL);

  if (action === CREATE) {
    channel.taggingRecordsPublished = channel.taggingRecordsPublished.plus(GraphBigInt.fromI32(1));
    channel.tagsApplied = channel.tagsApplied.plus(GraphBigInt.fromI32(newTagIds.length));

    for (let i = 0; i < newTagIds.length; i++) {
      const tag = ensureTag(newTagIds[i], event);
      updateChannelRevenue(channel, tag, channelFee);
    }
  }

  if (action === APPEND) {
    const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
    channel.tagsApplied = channel.tagsApplied.plus(GraphBigInt.fromI32(appendedTagIds.length));

    for (let i = 0; i < appendedTagIds.length; i++) {
      const tag = ensureTag(appendedTagIds[i], event);
      updateChannelRevenue(channel, tag, channelFee);
    }
  }

  if (action === REMOVE) {
    const removedTagIds = arrayDiff(previousTagIds, newTagIds);
    channel.tagsRemoved = channel.tagsRemoved.plus(GraphBigInt.fromI32(removedTagIds.length));

    for (let i = 0; i < removedTagIds.length; i++) {
      const tag = ensureTag(removedTagIds[i], event);
      if (tag.channel === channel.id) {
        channel.publishedTagsRemovedFromTaggingRecords = channel.publishedTagsRemovedFromTaggingRecords.plus(
          GraphBigInt.fromI32(1),
        );
      }
    }
    channel.save();
  }
}
