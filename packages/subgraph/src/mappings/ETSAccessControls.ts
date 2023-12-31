import { Bytes, store, BigInt, log } from "@graphprotocol/graph-ts";
import { Relayer } from "../generated/schema";
import { ETSRelayerV1 } from "../generated/templates";
import {
  ETSAccessControls,
  RoleGranted,
  RoleRevoked,
  PlatformSet,
  RelayerAdded,
  RelayerLockToggled,
  Initialized,
  Upgraded,
} from "../generated/ETSAccessControls/ETSAccessControls";
import { ensureRelease } from "../entities/Release";
import { ensureAdministrator } from "../entities/Administrator";
import { ensureRelayerAdmin } from "../entities/RelayerAdmin";
import { ensureRelayer } from "../entities/Relayer";
import { ensurePlatform } from "../entities/Platform";
import { updateRelayerCount } from "../entities/Platform";

import { ZERO, ONE, ADDED, PAUSED, UNPAUSED } from "../utils/constants";

const DEFAULT_ADMIN_ROLE = Bytes.fromHexString("0x0000000000000000000000000000000000000000000000000000000000000000");
const RELAYER_ROLE = Bytes.fromHexString("0xad312f08b8889cfe65ec2f1faae419f8b47f0153a3483ea6130918c055c8183d");
const RELAYER_ROLE_ADMIN = Bytes.fromHexString("0xceef0c25ed6578df50c5ed05e86b9a2fbef843ddc8e477a6712c47ac29939361");

export function handleInitialized(event: Initialized): void {
  let settings = ensureRelease();
  settings.etsAccessControls = event.address.toHexString();
  settings.etsAccessControlsVersion = BigInt.fromI32(event.params.version);
  settings.etsAccessControlsVersionDate = event.block.timestamp;
  settings.save();
}

export function handleUpgraded(event: Upgraded): void {}

export function handlePlatformSet(event: PlatformSet): void {
  let platform = ensurePlatform(event);
  if (platform) {
    platform.address = event.params.newAddress.toHexString();
    platform.save();
  }
}

export function handleRelayerAdded(event: RelayerAdded): void {
  ensureRelayer(event.params.relayer, event);
  ETSRelayerV1.create(event.params.relayer);
  updateRelayerCount(ADDED, event);
}

export function handleRelayerToggled(event: RelayerLockToggled): void {
  let relayer = ensureRelayer(event.params.relayer, event);
  if (relayer) {
    relayer.lockedByProtocol = !relayer.lockedByProtocol;
    relayer.save();

    const action = relayer.lockedByProtocol == true ? PAUSED : UNPAUSED;
    updateRelayerCount(action, event);
  }
}

export function handleRoleGranted(event: RoleGranted): void {
  if (event.params.role.equals(DEFAULT_ADMIN_ROLE)) {
    ensureAdministrator(event.params.account, event);
  }

  if (event.params.role.equals(RELAYER_ROLE_ADMIN)) {
    ensureRelayerAdmin(event.params.account, event);
  }
}

export function handleRoleRevoked(event: RoleRevoked): void {
  if (event.params.role.equals(DEFAULT_ADMIN_ROLE)) {
    let administrator = ensureAdministrator(event.params.account, event);
    if (administrator) {
      store.remove("Administrator", administrator.id);
    }
  }
  if (event.params.role.equals(RELAYER_ROLE_ADMIN)) {
    let relayerAdmin = ensureRelayerAdmin(event.params.account, event);
    if (relayerAdmin) {
      store.remove("RelayerAdmin", relayerAdmin.id);
    }
  }
}
