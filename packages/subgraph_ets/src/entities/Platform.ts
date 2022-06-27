import {Platform} from "../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts/index";

/*
 * constants for common BigInt numbers
 */
export const ONE = BigInt.fromI32(1);
export const ZERO = BigInt.fromI32(0);

export function ensurePlatform(id: string): Platform | null {
    let entity = Platform.load(id);

    if (entity === null) {
        entity = new Platform(id);
        entity.tagFees = ZERO;
    }

    return entity;
}
