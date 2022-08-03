import { Bytes, store } from "@graphprotocol/graph-ts";
// import { ETSAccessControls } from "../generated/ETSAccessControls/ETSAccessControls";
import {
  RoleGranted,
  RoleRevoked,
  PlatformSet,
  TargetTaggerAdded,
} from "../generated/ETSAccessControls/ETSAccessControls";

import { ensureAdministrator } from "../entities/Administrator";
import { ensurePublisherAdmin } from "../entities/PublisherAdmin";
import { ensurePublisher } from "../entities/Publisher";
import { ensurePlatform } from "../entities/Platform";
import { ensureTargetTagger } from "../entities/TargetTagger";

const DEFAULT_ADMIN_ROLE = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000000000000000000000000000"
);
const PUBLISHER_ROLE = Bytes.fromHexString(
  "0xad312f08b8889cfe65ec2f1faae419f8b47f0153a3483ea6130918c055c8183d"
);
const PUBLISHER_ROLE_ADMIN = Bytes.fromHexString(
  "0xceef0c25ed6578df50c5ed05e86b9a2fbef843ddc8e477a6712c47ac29939361"
);
// const SMART_CONTRACT_ROLE = Bytes.fromHexString(
//   "0x5474431f81b75a7b45d74ffe5ff51964b4290ef4c86184accd4e4a9822dae901"
// );

export function handleRoleGranted(event: RoleGranted): void {
  if (event.params.role.equals(DEFAULT_ADMIN_ROLE)) {
    let administrator = ensureAdministrator(
      event.params.account.toHexString(),
      event
    );
    // Not sure we need to save here as new publisher is saved via ensurePublisher.
    if (administrator) {
      administrator.save();
    }
  }
  if (event.params.role.equals(PUBLISHER_ROLE_ADMIN)) {
    let publisherAdmin = ensurePublisherAdmin(
      event.params.account.toHexString(),
      event
    );
    if (publisherAdmin) {
      publisherAdmin.save();
    }
  }
  if (event.params.role.equals(PUBLISHER_ROLE)) {
    let publisher = ensurePublisher(event.params.account.toHexString(), event);
    if (publisher) {
      publisher.save();
    }
  }
}

export function handleRoleRevoked(event: RoleRevoked): void {
  if (event.params.role.equals(DEFAULT_ADMIN_ROLE)) {
    let administrator = ensureAdministrator(
      event.params.account.toHexString(),
      event
    );
    if (administrator) {
      store.remove("Administrator", administrator.id);
    }
  }
  if (event.params.role.equals(PUBLISHER_ROLE_ADMIN)) {
    let publisherAdmin = ensurePublisherAdmin(
      event.params.account.toHexString(),
      event
    );
    if (publisherAdmin) {
      store.remove("PublisherAdmin", publisherAdmin.id);
    }
  }
  if (event.params.role.equals(PUBLISHER_ROLE)) {
    let publisher = ensurePublisher(event.params.account.toHexString(), event);
    if (publisher) {
      store.remove("Publisher", publisher.id);
    }
  }
}

export function handlePlatformSet(event: PlatformSet): void {
  //Fetch current platform address
  let prevPlatform = ensurePlatform(
    event.params.prevAddress.toHexString(),
    event
  );
  if (prevPlatform) {
    store.remove("Platform", prevPlatform.id);
  }
  let platform = ensurePlatform(event.params.newAddress.toHexString(), event);
  if (platform) {
    platform.save();
  }
}

export function handleTargetTaggerAdded(event: TargetTaggerAdded): void {
  let targetTagger = ensureTargetTagger(
    event.params.targetTagger.toHexString(),
    event
  );
  if (targetTagger) {
    targetTagger.save();
  }
}
