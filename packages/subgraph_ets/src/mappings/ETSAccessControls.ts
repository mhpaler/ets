import { Bytes } from "@graphprotocol/graph-ts";

import {
  RoleGranted,
  RoleAdminChanged,
  RoleRevoked,
  PlatformSet,
  PublisherDefaultThresholdSet,
  TargetTaggerPauseToggled,
} from "../generated/ETSAccessControls/ETSAccessControls";

import { ensurePublisher } from "../entities/Publisher";

const DEFAULT_ADMIN_ROLE = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000000000000000000000000000"
);
const PUBLISHER_ROLE = Bytes.fromHexString(
  "0xad312f08b8889cfe65ec2f1faae419f8b47f0153a3483ea6130918c055c8183d"
);
const PUBLISHER_ROLE_ADMIN = Bytes.fromHexString(
  "0xceef0c25ed6578df50c5ed05e86b9a2fbef843ddc8e477a6712c47ac29939361"
);
const SMART_CONTRACT_ROLE = Bytes.fromHexString(
  "0x5474431f81b75a7b45d74ffe5ff51964b4290ef4c86184accd4e4a9822dae901"
);

/*
 * Track roles that are granted to Ethereum accounts
 *
 * event.params.role - Role being granted (A SHA3 hash of the role name)
 * event.params.account - Account that's been given the role
 * event.params.sender - Account that issued the role
 *
 */
export function handleRoleGranted(event: RoleGranted): void {
  if (event.params.role.equals(PUBLISHER_ROLE)) {
    let entity = ensurePublisher(event.params.account.toHexString());
    if (entity) {
      entity.save();
    }
  }
}
