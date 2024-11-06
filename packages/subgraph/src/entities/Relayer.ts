import { Address, BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { ensureTag } from "../entities/Tag";
import { ETSAccessControls } from "../generated/ETSAccessControls/ETSAccessControls";
import { Transfer } from "../generated/ETSToken/ETSToken";
import { Relayer, Release } from "../generated/schema";
import { ETSRelayerV1 } from "../generated/templates/ETSRelayerV1/ETSRelayerV1";
import { arrayDiff } from "../utils/arrayDiff";
import { APPEND, CREATE, ONE, RELAYER, REMOVE, ZERO, ZERO_ADDRESS } from "../utils/constants";
import { getTaggingFee } from "../utils/getTaggingFee";
import { logCritical } from "../utils/logCritical";

export function ensureRelayer(relayerAddress: Address, event: ethereum.Event): Relayer {
  let relayer = Relayer.load(relayerAddress.toHex());
  const release = Release.load("ETSRelease");

  if (relayer === null && release && event) {
    const contract = ETSAccessControls.bind(Address.fromString(release.etsAccessControls));
    const contractToNameCall = contract.try_relayerContractToName(relayerAddress);
    if (contractToNameCall.reverted) {
      logCritical("relayerContractToName reverted for {}", [relayerAddress.toString()]);
    }
    const isRelayerAdminCall = contract.try_isRelayerAdmin(relayerAddress);
    if (isRelayerAdminCall.reverted) {
      logCritical("isRelayerAdminCall reverted for {}", [relayerAddress.toString()]);
    }
    const isRelayerLocked = contract.try_isRelayerLocked(relayerAddress);
    if (isRelayerLocked.reverted) {
      logCritical("isRelayerLocked reverted for {}", [relayerAddress.toString()]);
    }

    let owner: string = relayerAddress.toHex();
    let creator: string = relayerAddress.toHex();
    let isPausedByOwner = false;

    if (isRelayerAdminCall.value === false) {
      // This is a RelayerFactory contract. Let's fetch some onchain values.
      const relayerContract = ETSRelayerV1.bind(relayerAddress);
      const getOwnerCall = relayerContract.try_getOwner();
      if (getOwnerCall.reverted) {
        logCritical("getOwnerCall reverted for {}", [relayerAddress.toString()]);
      } else {
        owner = getOwnerCall.value.toHex();
      }

      const getCreatorCall = relayerContract.try_getCreator();
      if (getCreatorCall.reverted) {
        logCritical("getCreatorCall reverted for {}", [relayerAddress.toString()]);
      } else {
        creator = getCreatorCall.value.toHex();
      }
      const isPausedByOwnerCall = relayerContract.try_isPaused();
      if (isPausedByOwnerCall.reverted) {
        logCritical("isPausedByOwnerCall reverted for {}", [relayerAddress.toString()]);
      } else {
        isPausedByOwner = isPausedByOwnerCall.value;
      }
    }

    relayer = new Relayer(relayerAddress.toHex());
    relayer.name = contractToNameCall.value;
    relayer.admin = isRelayerAdminCall.value;
    relayer.lockedByProtocol = isRelayerLocked.value;
    relayer.owner = owner;
    relayer.creator = creator;
    relayer.pausedByOwner = isPausedByOwner;
    relayer.firstSeen = event.block.timestamp;
    relayer.tagsPublished = ZERO;
    relayer.tagsApplied = ZERO;
    relayer.tagsRemoved = ZERO;
    relayer.taggingRecordsPublished = ZERO;
    relayer.taggingRecordTxns = ZERO;
    relayer.publishedTagsAddedToTaggingRecords = ZERO;
    relayer.publishedTagsRemovedFromTaggingRecords = ZERO;
    relayer.publishedTagsAuctionRevenue = ZERO;
    relayer.publishedTagsTaggingFeeRevenue = ZERO;
    relayer.save();
  }

  return relayer as Relayer;
}

export function updateRelayerTagStats(relayerAddress: Address, event: Transfer): void {
  const relayer = ensureRelayer(relayerAddress, event);
  const fromAddress = event.params.from;
  const zeroAddress = Address.fromString(ZERO_ADDRESS);

  if (relayer && fromAddress.equals(zeroAddress)) {
    relayer.tagsPublished = relayer.tagsPublished.plus(ONE);
    relayer.save();
  }
}

export function updateRelayerTaggingRecordStats(
  relayerAddress: Address,
  newTagIds: string[] | null,
  previousTagIds: string[] | null,
  action: GraphBigInt,
  event: ethereum.Event,
): void {
  const relayer = ensureRelayer(relayerAddress, event);

  // Log relayer lifetime txn count, no matter the tagging action.
  relayer.taggingRecordTxns = relayer.taggingRecordTxns.plus(ONE);

  if (action === CREATE) {
    // This relayer is hosting a new tagging record.
    relayer.taggingRecordsPublished = relayer.taggingRecordsPublished.plus(ONE);
  }

  if (newTagIds && previousTagIds) {
    if (action === CREATE) {
      relayer.tagsApplied = relayer.tagsApplied.plus(GraphBigInt.fromI32(newTagIds.length));
    }

    // Log the relayers action count regardless of tag provenance.
    if (action === APPEND) {
      const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      relayer.tagsApplied = relayer.tagsApplied.plus(GraphBigInt.fromI32(appendedTagIds.length));
    }

    if (action === REMOVE) {
      const removedTagIds = arrayDiff(previousTagIds, newTagIds);
      relayer.tagsRemoved = relayer.tagsRemoved.plus(GraphBigInt.fromI32(removedTagIds.length));
    }

    // Next go through each tag and if relayer is the original tag relayer, log those stats.
    const relayerFee = getTaggingFee(RELAYER);

    if (action === CREATE) {
      for (let i = 0; i < newTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(newTagIds[i]), event);
        if (tag.relayer === relayerAddress.toHex()) {
          relayer.publishedTagsAddedToTaggingRecords = relayer.publishedTagsAddedToTaggingRecords.plus(ONE);
          relayer.publishedTagsTaggingFeeRevenue = relayer.publishedTagsTaggingFeeRevenue.plus(relayerFee);
        }
      }
    }

    if (action === APPEND) {
      const appendedTagIds = arrayDiff(newTagIds, previousTagIds);
      for (let i = 0; i < appendedTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(appendedTagIds[i]), event);
        if (tag.relayer === relayerAddress.toHex()) {
          relayer.publishedTagsAddedToTaggingRecords = relayer.publishedTagsAddedToTaggingRecords.plus(ONE);
          relayer.publishedTagsTaggingFeeRevenue = relayer.publishedTagsTaggingFeeRevenue.plus(relayerFee);
        }
      }
    }

    if (action === REMOVE) {
      const removedTagIds = arrayDiff(previousTagIds, newTagIds);
      for (let i = 0; i < removedTagIds.length; i++) {
        const tag = ensureTag(GraphBigInt.fromString(removedTagIds[i]), event);
        if (tag.relayer === relayerAddress.toHex()) {
          relayer.publishedTagsRemovedFromTaggingRecords = relayer.publishedTagsRemovedFromTaggingRecords.plus(ONE);
        }
      }
    }
  }
  relayer.save();
}
