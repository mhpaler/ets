import { ensureChannel } from "../entities/Channel";
import {
  ChannelOwnerChanged,
  ChannelPauseToggledByOwner,
  ETSChannel,
  OwnershipTransferred,
  Paused,
  Unpaused,
} from "../generated/templates/ETSChannel/ETSChannel";
import { logCritical } from "../utils/logCritical";

export function handleChannelPauseToggledByOwner(event: ChannelPauseToggledByOwner): void {
  const channel = ensureChannel(event.params.channelAddress, event);

  if (channel && event) {
    const contract = ETSChannel.bind(event.params.channelAddress);
    const isPausedByOwnerCall = contract.try_isPaused();
    if (isPausedByOwnerCall.reverted) {
      logCritical("isPausedByOwner reverted for {}", [event.params.channelAddress.toString()]);
    }

    channel.pausedByOwner = isPausedByOwnerCall.value;
    channel.save();
  }
}

export function handleChannelOwnerChanged(event: ChannelOwnerChanged): void {
  const channel = ensureChannel(event.params.channelAddress, event);

  if (channel && event) {
    const contract = ETSChannel.bind(event.params.channelAddress);
    const getOwnerCall = contract.try_getOwner();
    if (getOwnerCall.reverted) {
      logCritical("getOwnerCall reverted for {}", [event.params.channelAddress.toString()]);
    }
    channel.owner = getOwnerCall.value.toHex();
    channel.save();
  }
}

export function handleOwnershipTransferred(_event: OwnershipTransferred): void {}

export function handlePausedByOwner(_event: Paused): void {}

export function handleUnpausedByOwner(_event: Unpaused): void {}
