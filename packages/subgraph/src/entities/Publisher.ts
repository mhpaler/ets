import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Release, Publisher } from "../generated/schema";
import { Transfer } from "../generated/ETSToken/ETSToken";
import { ensureTag } from "../entities/Tag";
import { ETSAccessControls } from "../generated/ETSAccessControls/ETSAccessControls";
import { getTaggingFee } from "../utils/getTaggingFee";
import { arrayDiff } from "../utils/arrayDiff";
import { logCritical } from "../utils/logCritical";
import { ZERO_ADDRESS, ZERO, ONE, CREATE, APPEND, REMOVE, PLATFORM, PUBLISHER, OWNER } from "../utils/constants";

export function ensurePublisher(publisherAddress: Address, event: ethereum.Event): Publisher {
  let publisher = Publisher.load(publisherAddress.toHex());
  let release = Release.load("ETSRelease");

  if (publisher === null && release && event) {
    let contract = ETSAccessControls.bind(Address.fromString(release.etsAccessControls));
    let contractToNameCall = contract.try_publisherContractToName(publisherAddress);
    if (contractToNameCall.reverted) {
      logCritical("publisherContractToName reverted for {}", [publisherAddress.toString()]);
    }
    let isPublisherAdminCall = contract.try_isPublisherAdmin(publisherAddress);
    if (isPublisherAdminCall.reverted) {
      logCritical("isPublisherAdminCall reverted for {}", [publisherAddress.toString()]);
    }

    publisher = new Publisher(publisherAddress.toHex());
    publisher.name = contractToNameCall.value;
    publisher.admin = isPublisherAdminCall.value;
    publisher.pausedByProtocol = true;
    publisher.firstSeen = event.block.timestamp;
    publisher.tagsPublished = ZERO;
    publisher.tagsApplied = ZERO;
    publisher.tagsRemoved = ZERO;
    publisher.taggingRecordsPublished = ZERO;
    publisher.taggingRecordTxns = ZERO;
    publisher.publishedTagsAddedToTaggingRecords = ZERO;
    publisher.publishedTagsRemovedFromTaggingRecords = ZERO;
    publisher.publishedTagsAuctionRevenue = ZERO;
    publisher.publishedTagsTaggingFeeRevenue = ZERO;
    publisher.save();
  }

  return publisher as Publisher;
}

export function updatePublisherTagStats(publisherAddress: Address, event: Transfer): void {
  let publisher = ensurePublisher(publisherAddress, event);
  if (publisher && event.params.from.toHexString() == ZERO_ADDRESS) {
    publisher.tagsPublished = publisher.tagsPublished.plus(ONE);
    publisher.save();
  }
}

export function updatePublisherTaggingRecordStats(
  publisherAddress: Address,
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: BigInt,
  event: ethereum.Event,
): void {
  let publisher = ensurePublisher(publisherAddress, event);

  // Log publisher lifetime txn count, no matter the tagging action.
  publisher.taggingRecordTxns = publisher.taggingRecordTxns.plus(ONE);

  if (action == CREATE) {
    // This publisher is hosting a new tagging record.
    publisher.taggingRecordsPublished = publisher.taggingRecordsPublished.plus(ONE);
  }

  if (newTagIds && previousTagIds) {
    if (action == CREATE) {
      publisher.tagsApplied = publisher.tagsApplied.plus(BigInt.fromI32(newTagIds.length));
    }

    // Log the publishers action count regardless of tag provenance.
    if (action == APPEND) {
      let appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      publisher.tagsApplied = publisher.tagsApplied.plus(BigInt.fromI32(appendedTagIds.length));
    }

    if (action == REMOVE) {
      let removedTagIds = arrayDiff(previousTagIds, newTagIds);
      publisher.tagsRemoved = publisher.tagsRemoved.plus(BigInt.fromI32(removedTagIds.length));
    }

    // Next go through each tag and if publisher is the original tag publisher, log those stats.
    let publisherFee = getTaggingFee(PUBLISHER);

    if (action == CREATE) {
      for (let i = 0; i < newTagIds.length; i++) {
        let tag = ensureTag(BigInt.fromString(newTagIds[i]), event);
        if (tag.publisher == publisherAddress.toHex()) {
          publisher.publishedTagsAddedToTaggingRecords = publisher.publishedTagsAddedToTaggingRecords.plus(ONE);
          publisher.publishedTagsTaggingFeeRevenue = publisher.publishedTagsTaggingFeeRevenue.plus(publisherFee);
        }
      }
    }

    if (action == APPEND) {
      let appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      for (let i = 0; i < appendedTagIds.length; i++) {
        let tag = ensureTag(BigInt.fromString(appendedTagIds[i]), event);
        if (tag.publisher == publisherAddress.toHex()) {
          publisher.publishedTagsAddedToTaggingRecords = publisher.publishedTagsAddedToTaggingRecords.plus(ONE);
          publisher.publishedTagsTaggingFeeRevenue = publisher.publishedTagsTaggingFeeRevenue.plus(publisherFee);
        }
      }
    }

    if (action == REMOVE) {
      let removedTagIds = arrayDiff(previousTagIds, newTagIds);
      for (let i = 0; i < removedTagIds.length; i++) {
        let tag = ensureTag(BigInt.fromString(removedTagIds[i]), event);
        if (tag.publisher == publisherAddress.toHex()) {
          publisher.publishedTagsRemovedFromTaggingRecords = publisher.publishedTagsRemovedFromTaggingRecords.plus(ONE);
        }
      }
    }
  }
  publisher.save();
}
