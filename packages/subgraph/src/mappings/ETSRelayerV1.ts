import { ensureRelayer } from "../entities/Relayer";
import {
  ETSRelayerV1,
  OwnershipTransferred,
  Paused,
  RelayerOwnerChanged,
  RelayerPauseToggledByOwner,
  Unpaused,
} from "../generated/templates/ETSRelayerV1/ETSRelayerV1";
import { logCritical } from "../utils/logCritical";

export function handleRelayerPauseToggledByOwner(event: RelayerPauseToggledByOwner): void {
  const relayer = ensureRelayer(event.params.relayerAddress, event);

  if (relayer && event) {
    const contract = ETSRelayerV1.bind(event.params.relayerAddress);
    const isPausedByOwnerCall = contract.try_isPaused();
    if (isPausedByOwnerCall.reverted) {
      logCritical("isPausedByOwner reverted for {}", [event.params.relayerAddress.toString()]);
    }

    relayer.pausedByOwner = isPausedByOwnerCall.value;
    relayer.save();
  }
}

export function handleRelayerOwnerChanged(event: RelayerOwnerChanged): void {
  const relayer = ensureRelayer(event.params.relayerAddress, event);

  if (relayer && event) {
    const contract = ETSRelayerV1.bind(event.params.relayerAddress);
    const getOwnerCall = contract.try_getOwner();
    if (getOwnerCall.reverted) {
      logCritical("getOwnerCall reverted for {}", [event.params.relayerAddress.toString()]);
    }
    relayer.owner = getOwnerCall.value.toHex();
    relayer.save();
  }
}

export function handleOwnershipTransferred(_event: OwnershipTransferred): void {}

export function handlePausedByOwner(_event: Paused): void {}

export function handleUnpausedByOwner(_event: Unpaused): void {}
