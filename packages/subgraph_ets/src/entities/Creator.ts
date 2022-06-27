import {Creator} from "../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts/index";


/*
 * constants for common BigInt numbers
 */
export const ONE = BigInt.fromI32(1);
export const ZERO = BigInt.fromI32(0);

export function ensureCreator(id: string): Creator | null {
    let entity = Creator.load(id);

    if (entity === null) {
        entity = new Creator(id);
        entity.mintCount = ZERO;
        entity.tagCount = ZERO;
        entity.tagFees = ZERO;
    }

    return entity;
}
