import { Bytes, BigInt as GraphBigInt, log, store } from "@graphprotocol/graph-ts";
import { ensureAdministrator } from "../entities/Administrator";
import { ensureChannel } from "../entities/Channel";
import { ensureChannelAdmin } from "../entities/ChannelAdmin";
import { ensurePlatform, updateChannelCount } from "../entities/Platform";
import { ensureRelease } from "../entities/Release";
import {
  ChannelAdded,
  ChannelLockToggled,
  Initialized,
  PlatformSet,
  RoleGranted,
  RoleRevoked,
  Upgraded,
} from "../generated/ETSAccessControls/ETSAccessControls";
import { ETSChannel } from "../generated/templates";

import { ADDED, PAUSED, UNPAUSED } from "../utils/constants";

const DEFAULT_ADMIN_ROLE = Bytes.fromHexString("0x0000000000000000000000000000000000000000000000000000000000000000");
const CHANNEL_ROLE_ADMIN = Bytes.fromHexString("0xceef0c25ed6578df50c5ed05e86b9a2fbef843ddc8e477a6712c47ac29939361");

export function handleInitialized(event: Initialized): void {
  const settings = ensureRelease();
  settings.etsAccessControls = event.address.toHexString();
  settings.etsAccessControlsVersion = GraphBigInt.fromI32(event.params.version);
  settings.etsAccessControlsVersionDate = event.block.timestamp;
  settings.save();
}

export function handleUpgraded(_event: Upgraded): void {}

export function handlePlatformSet(event: PlatformSet): void {
  const platform = ensurePlatform(event);
  if (platform) {
    platform.address = event.params.newAddress.toHexString();
    platform.save();
  }
}

export function handleChannelAdded(event: ChannelAdded): void {
  ensureChannel(event.params.channel, event);
  ETSChannel.create(event.params.channel);
  updateChannelCount(ADDED, event);
}

export function handleChannelToggled(event: ChannelLockToggled): void {
  const channel = ensureChannel(event.params.channel, event);
  if (channel) {
    channel.lockedByProtocol = !channel.lockedByProtocol;
    channel.save();

    const action = channel.lockedByProtocol === true ? PAUSED : UNPAUSED;
    updateChannelCount(action, event);
  }
}

export function handleRoleGranted(event: RoleGranted): void {
  if (event.params.role.equals(DEFAULT_ADMIN_ROLE)) {
    ensureAdministrator(event.params.account, event);
  }

  if (event.params.role.equals(CHANNEL_ROLE_ADMIN)) {
    ensureChannelAdmin(event.params.account, event);
  }
}

export function handleRoleRevoked(event: RoleRevoked): void {
  if (event.params.role.equals(DEFAULT_ADMIN_ROLE)) {
    const administrator = ensureAdministrator(event.params.account, event);
    if (administrator) {
      store.remove("Administrator", administrator.id);
    }
  }
  if (event.params.role.equals(CHANNEL_ROLE_ADMIN)) {
    const channelAdmin = ensureChannelAdmin(event.params.account, event);
    if (channelAdmin) {
      store.remove("ChannelAdmin", channelAdmin.id);
    }
  }
}
