import {Tagger} from "../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts/index";

/*
 * constants for common BigInt numbers
 */
export const ONE = BigInt.fromI32(1);
export const ZERO = BigInt.fromI32(0);

export function ensureTagger(id: string): Tagger | null {
    let entity = Tagger.load(id);

    if (entity === null) {
        entity = new Tagger(id);
        entity.tagCount = ZERO;
        entity.feesPaid = ZERO;
    }

    return entity;
}