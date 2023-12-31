import { BigInt } from "@graphprotocol/graph-ts/index";

export const ONE = BigInt.fromI32(1);
export const ZERO = BigInt.fromI32(0);
export const MODULO = BigInt.fromI32(100);
export const ZERO_ADDRESS: string = "0x0000000000000000000000000000000000000000";

// Actors
export const PLATFORM = BigInt.fromI32(0);
export const RELAYER = BigInt.fromI32(1);
export const OWNER = BigInt.fromI32(2);
export const CREATOR = BigInt.fromI32(3);
export const TAGGER = BigInt.fromI32(4);

// Tagging Actions
export const CREATE = BigInt.fromI32(3);
export const APPEND = BigInt.fromI32(0);
export const REMOVE = BigInt.fromI32(2);

// Relayer Actions
export const ADDED = BigInt.fromI32(0);
export const PAUSED = BigInt.fromI32(1);
export const UNPAUSED = BigInt.fromI32(2);
