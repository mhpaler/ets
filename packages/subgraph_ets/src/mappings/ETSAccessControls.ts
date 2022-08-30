import { Bytes, store, BigInt, log } from "@graphprotocol/graph-ts";
import { Publisher } from "../generated/schema";
import {
  ETSAccessControls,
  RoleGranted,
  RoleRevoked,
  PlatformSet,
  PublisherAdded,
  PublisherPauseToggled,
} from "../generated/ETSAccessControls/ETSAccessControls";
import { ensureAdministrator } from "../entities/Administrator";
import { ensurePublisherAdmin } from "../entities/PublisherAdmin";
import { ensurePublisher } from "../entities/Publisher";
import { ensurePlatform } from "../entities/Platform";

const ZERO = BigInt.fromI32(0);

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
export function handlePublisherAdded(event: PublisherAdded): void {
  let publisherAddress = event.params.publisher.toHexString();
  //log.info("================ publisherAddress: {}", [publisherAddress]);
  let etsAccessControls: ETSAccessControls = ETSAccessControls.bind(
    event.address
  );

  let publisher = new Publisher(publisherAddress);
  publisher.name = etsAccessControls.publisherContractToName(
    event.params.publisher
  );
  // Publishers are always in paused state when added by ETS.
  publisher.pausedByProtocol = true;
  publisher.firstSeen = event.block.timestamp;
  publisher.mintCount = ZERO;
  publisher.tagCount = ZERO;
  publisher.tagFees = ZERO;
  if (event.params.isAdmin) {
    // ETS wallet address set up as publisher for testing purposes.
    publisher.admin = true;
  } else {
    // This is a genuine Publisher contract.
    publisher.admin = false;
  }
  publisher.save();
}

export function handlePublisherToggled(event: PublisherPauseToggled): void {
  let publisher = ensurePublisher(event.params.publisher, event);
  if (publisher) {
    publisher.pausedByProtocol = !publisher.pausedByProtocol;
    publisher.save();
  }
}

export function handleRoleGranted(event: RoleGranted): void {
  if (event.params.role.equals(DEFAULT_ADMIN_ROLE)) {
    let administrator = ensureAdministrator(event.params.account, event);
    // Not sure we need to save here as new publisher is saved via ensurePublisher.
    if (administrator) {
      administrator.save();
    }
  }
  if (event.params.role.equals(PUBLISHER_ROLE_ADMIN)) {
    let publisherAdmin = ensurePublisherAdmin(event.params.account, event);
    if (publisherAdmin) {
      publisherAdmin.save();
    }
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

export function handlePlatformSet(event: PlatformSet): void {
  //Fetch current platform address
  let prevPlatform = ensurePlatform(event.params.prevAddress, event);
  if (prevPlatform) {
    store.remove("Platform", prevPlatform.id);
  }
  let platform = ensurePlatform(event.params.newAddress, event);
  if (platform) {
    platform.save();
  }
}
