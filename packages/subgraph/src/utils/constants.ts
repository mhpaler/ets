import { BigInt as GraphBigInt } from "@graphprotocol/graph-ts/index";

export const ONE = GraphBigInt.fromI32(1);
export const ZERO = GraphBigInt.fromI32(0);
export const MODULO = GraphBigInt.fromI32(100);
export const ZERO_ADDRESS: string = "0x0000000000000000000000000000000000000000";

// Actors
export const PLATFORM = GraphBigInt.fromI32(0);
export const RELAYER = GraphBigInt.fromI32(1);
export const OWNER = GraphBigInt.fromI32(2);
export const CREATOR = GraphBigInt.fromI32(3);
export const TAGGER = GraphBigInt.fromI32(4);

// Tagging Actions
export const CREATE = GraphBigInt.fromI32(3);
export const APPEND = GraphBigInt.fromI32(0);
export const REMOVE = GraphBigInt.fromI32(2);

// Relayer Actions
export const ADDED = GraphBigInt.fromI32(0);
export const PAUSED = GraphBigInt.fromI32(1);
export const UNPAUSED = GraphBigInt.fromI32(2);
