import { Bytes, store, BigInt, log } from "@graphprotocol/graph-ts";
import { Publisher } from "../generated/schema";
import { ETSPublisherV1 } from "../generated/templates";
import {
  ETSAccessControls,
  RoleGranted,
  RoleRevoked,
  PlatformSet,
  PublisherAdded,
  PublisherPauseToggled,
  Initialized,
  Upgraded,
} from "../generated/ETSAccessControls/ETSAccessControls";
import { ensureRelease } from "../entities/Release";
import { ensureAdministrator } from "../entities/Administrator";
import { ensurePublisherAdmin } from "../entities/PublisherAdmin";
import { ensurePublisher } from "../entities/Publisher";
import { ensurePlatform } from "../entities/Platform";
import { updatePublisherCount } from "../entities/Platform";

import { ZERO, ONE, ADDED, PAUSED, UNPAUSED } from "../utils/constants";

const DEFAULT_ADMIN_ROLE = Bytes.fromHexString("0x0000000000000000000000000000000000000000000000000000000000000000");
const PUBLISHER_ROLE = Bytes.fromHexString("0xad312f08b8889cfe65ec2f1faae419f8b47f0153a3483ea6130918c055c8183d");
const PUBLISHER_ROLE_ADMIN = Bytes.fromHexString("0xceef0c25ed6578df50c5ed05e86b9a2fbef843ddc8e477a6712c47ac29939361");

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

export function handlePublisherAdded(event: PublisherAdded): void {
  ensurePublisher(event.params.publisher, event);
  ETSPublisherV1.create(event.params.publisher);
  updatePublisherCount(ADDED, event);
}

export function handlePublisherToggled(event: PublisherPauseToggled): void {
  let publisher = ensurePublisher(event.params.publisher, event);
  if (publisher) {
    publisher.pausedByProtocol = !publisher.pausedByProtocol;
    publisher.save();

    const action = publisher.pausedByProtocol == true ? PAUSED : UNPAUSED;
    updatePublisherCount(action, event);
  }
}

export function handleRoleGranted(event: RoleGranted): void {
  if (event.params.role.equals(DEFAULT_ADMIN_ROLE)) {
    ensureAdministrator(event.params.account, event);
  }

  if (event.params.role.equals(PUBLISHER_ROLE_ADMIN)) {
    ensurePublisherAdmin(event.params.account, event);
  }
}

export function handleRoleRevoked(event: RoleRevoked): void {
  if (event.params.role.equals(DEFAULT_ADMIN_ROLE)) {
    let administrator = ensureAdministrator(event.params.account, event);
    if (administrator) {
      store.remove("Administrator", administrator.id);
    }
  }
  if (event.params.role.equals(PUBLISHER_ROLE_ADMIN)) {
    let publisherAdmin = ensurePublisherAdmin(event.params.account, event);
    if (publisherAdmin) {
      store.remove("PublisherAdmin", publisherAdmin.id);
    }
  }
}
