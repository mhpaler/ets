import {
  ETSPublisherV1,
  PublisherPauseToggledByOwner,
  PublisherOwnerChanged,
  OwnershipTransferred,
  Paused,
  Unpaused,
} from "../generated/templates/ETSPublisherV1/ETSPublisherV1";
import { ensurePublisher } from "../entities/Publisher";
import { logCritical } from "../utils/logCritical";

export function handlePublisherPauseToggledByOwner(event: PublisherPauseToggledByOwner): void {
  let publisher = ensurePublisher(event.params.publisherAddress, event);

  if (publisher && event) {
    let contract = ETSPublisherV1.bind(event.params.publisherAddress);
    let isPausedByOwnerCall = contract.try_isPausedByOwner();
    if (isPausedByOwnerCall.reverted) {
      logCritical("isPausedByOwner reverted for {}", [event.params.publisherAddress.toString()]);
    }

    publisher.pausedByOwner = isPausedByOwnerCall.value;
    publisher.save();
  }
}

export function handlePublisherOwnerChanged(event: PublisherOwnerChanged): void {
  let publisher = ensurePublisher(event.params.publisherAddress, event);

  if (publisher && event) {
    let contract = ETSPublisherV1.bind(event.params.publisherAddress);
    let getOwnerCall = contract.try_getOwner();
    if (getOwnerCall.reverted) {
      logCritical("getOwnerCall reverted for {}", [event.params.publisherAddress.toString()]);
    }
    publisher.owner = getOwnerCall.value.toHex();
    publisher.save();
  }
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePausedByOwner(event: Paused): void {}

export function handleUnpausedByOwner(event: Unpaused): void {}
