import {Creator_v2} from "../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts/index";


/*
 * constants for common BigInt numbers
 */
export const ONE = BigInt.fromI32(1);
export const ZERO = BigInt.fromI32(0);

export function ensureCreator(id: string): Creator_v2 | null {
    let entity = Creator_v2.load(id);

    if (entity === null) {
        entity = new Creator_v2(id);
        entity.mintCount = ZERO;
        entity.tagCount = ZERO;
        entity.tagFees = ZERO;
    }

    return entity;
}
