import { Tag } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts/index";
import { ETSToken, Transfer } from "../generated/ETSToken/ETSToken";

import { toLowerCase } from "../utils/helpers";

export const ZERO = BigInt.fromI32(0);

export function ensureTag(id: string, event: Transfer | null): Tag {
  let tag = Tag.load(id);

  if (tag === null && event) {
    tag = new Tag(id);
    let tagContract = ETSToken.bind(event.address);
    let tagStruct = tagContract.getTagById(event.params.tokenId);
    let lowerTag: string = toLowerCase(tagStruct.display);

    tag.machineName = lowerTag.substring(1, lowerTag.length);
    tag.display = tagStruct.display;
    tag.owner = tagContract.getPlatformAddress().toHexString();
    tag.creator = tagStruct.creator.toHexString();
    tag.publisher = tagStruct.publisher.toHexString();
    tag.timestamp = event.block.timestamp;
    tag.tagCount = ZERO;
    tag.premium = tagStruct.premium;
    tag.reserved = tagStruct.reserved;
    tag.ownerRevenue = ZERO;
    tag.publisherRevenue = ZERO;
    tag.protocolRevenue = ZERO;
    tag.creatorRevenue = ZERO;
    tag.save();
  }

  return tag as Tag;
}
