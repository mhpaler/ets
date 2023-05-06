import {
  ETSRelayerV1,
  RelayerPauseToggledByOwner,
  RelayerOwnerChanged,
  OwnershipTransferred,
  Paused,
  Unpaused,
} from "../generated/templates/ETSRelayerV1/ETSRelayerV1";
import { ensureRelayer } from "../entities/Relayer";
import { logCritical } from "../utils/logCritical";

export function handleRelayerPauseToggledByOwner(event: RelayerPauseToggledByOwner): void {
  let relayer = ensureRelayer(event.params.relayerAddress, event);

  if (relayer && event) {
    let contract = ETSRelayerV1.bind(event.params.relayerAddress);
    let isPausedByOwnerCall = contract.try_isPausedByOwner();
    if (isPausedByOwnerCall.reverted) {
      logCritical("isPausedByOwner reverted for {}", [event.params.relayerAddress.toString()]);
    }

    relayer.pausedByOwner = isPausedByOwnerCall.value;
    relayer.save();
  }
}

export function handleRelayerOwnerChanged(event: RelayerOwnerChanged): void {
  let relayer = ensureRelayer(event.params.relayerAddress, event);

  if (relayer && event) {
    let contract = ETSRelayerV1.bind(event.params.relayerAddress);
    let getOwnerCall = contract.try_getOwner();
    if (getOwnerCall.reverted) {
      logCritical("getOwnerCall reverted for {}", [event.params.relayerAddress.toString()]);
    }
    relayer.owner = getOwnerCall.value.toHex();
    relayer.save();
  }
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePausedByOwner(event: Paused): void {}

export function handleUnpausedByOwner(event: Unpaused): void {}
