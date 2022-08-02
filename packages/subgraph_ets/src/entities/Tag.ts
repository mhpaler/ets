import { Tag } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts/index";
import { ETSToken, Transfer } from "../generated/ETSToken/ETSToken";

import { toLowerCase } from "../utils/helpers";

export const ZERO = BigInt.fromI32(0);

export function ensureTag(
  id: string,
  event: Transfer
): Tag {
  let tag = Tag.load(id);

  if (tag === null) {
    tag = new Tag(event.params.tokenId.toString());
    let tagContract = ETSToken.bind(event.address);
    let tagStruct = tagContract.getTag(event.params.tokenId);
  
    tag.display = tagStruct.display;
  
    let lowerTag: string = toLowerCase(tagStruct.display);
  
    tag.machineName = lowerTag.substring(1, lowerTag.length);
  
    tag.owner = tagContract.getPlatformAddress().toString();
    tag.creator = tagStruct.creator.toString();
    tag.publisher = tagStruct.publisher.toString();
    tag.timestamp = event.block.timestamp;
    tag.tagCount = BigInt.fromI32(0);
    tag.ownerRevenue = BigInt.fromI32(0);
    tag.publisherRevenue = BigInt.fromI32(0);
    tag.protocolRevenue = BigInt.fromI32(0);
    tag.creatorRevenue = BigInt.fromI32(0);
    tag.save();
  }

  return tag as Tag;
}