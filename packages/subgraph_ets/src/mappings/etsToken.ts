import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer, ETSToken } from "../generated/ETSToken/ETSToken";
import { Tag } from "../generated/schema";
import {
  toLowerCase,
  safeLoadOwner,
  safeLoadPlatform,
  safeLoadPublisher,
  ONE,
  safeLoadCreator,
} from "../utils/helpers";

/*
 * Track the minting of a tag
 *
 * event.params.tokenId NFT ID of the tag
 * event.params.tag Tag text
 * event.params.owner Owner of the new tag
 * event.params.publisher Publisher which facilitated the tag
 * event.params.publisherFee Fee earned by the publisher
 * event.params.platformFee Fee earned by ETS
 *
 * Notes
 *  In addition to the data generated by a tag, further data points are generated:
 *   - Count of how many tags owned by an Ethereum address
 *   - Fees earned by the platform and publishers across all minting events
 */
export function handleCreateTag(event: Transfer): void {
  let tagEntity = new Tag(event.params.tokenId.toString());
  let tagContract = ETSToken.bind(event.address);
  let tagStruct = tagContract.tokenIdToTag(event.params.tokenId);

  tagEntity.display = tagStruct.value2;

  let lowerTag: string = toLowerCase(tagStruct.value2);

  tagEntity.machineName = lowerTag.substring(1, lowerTag.length);

  tagEntity.owner = tagContract.getPlatformAddress().toString();
  tagEntity.creator = tagStruct.value1.toString();
  tagEntity.publisher = tagStruct.value0.toString();
  tagEntity.timestamp = event.block.timestamp;
  tagEntity.tagCount = BigInt.fromI32(0);
  tagEntity.ownerRevenue = BigInt.fromI32(0);
  tagEntity.publisherRevenue = BigInt.fromI32(0);
  tagEntity.protocolRevenue = BigInt.fromI32(0);
  tagEntity.creatorRevenue = BigInt.fromI32(0);
  tagEntity.save();

  let owner = safeLoadOwner(tagEntity.owner);

  if (owner) {
    owner.mintCount = owner.mintCount.plus(ONE);
    owner.save();
  }

  // publisher
  let publisher = safeLoadPublisher(tagEntity.publisher);

  if (publisher) {
    publisher.mintCount = publisher.mintCount.plus(ONE);
    publisher.save();
  }

  // platform
  let platform = safeLoadPlatform("platform");

  if (platform) {
    platform.save();
  }

  // creator
  let creator = safeLoadCreator(tagStruct.value1.toHexString());

  if (creator) {
    creator.mintCount = creator.mintCount.plus(ONE);
    creator.save();
  }
}

// ////////////////////////////////////////////////////////////
//   //Version 2
//   ////////////////////////////////////////////////////////////
//   let hashtagEntity_v2 = new Hashtag_v2(event.params.tokenId.toString());
//   let hashtagContract_v2 = HashtagProtocol.bind(event.address);
//   let hashtag_v2 = hashtagContract_v2.tokenIdToHashtag(event.params.tokenId);

//   hashtagEntity_v2.name = hashtag_v2.value2;
//   hashtagEntity_v2.displayHashtag = event.params.displayHashtag;

//   let displayHashtag_v2: string = event.params.displayHashtag;
//   let lowerHashtag_v2: string = toLowerCase(displayHashtag_v2);

//   hashtagEntity_v2.hashtag = lowerHashtag_v2;
//   hashtagEntity_v2.hashtagWithoutHash = lowerHashtag_v2.substring(1, lowerHashtag_v2.length);
//   hashtagEntity_v2.timestamp = event.block.timestamp;
//   hashtagEntity_v2.tagCount = BigInt.fromI32(0);
//   hashtagEntity_v2.ownerRevenue = BigInt.fromI32(0);
//   hashtagEntity_v2.publisherRevenue = BigInt.fromI32(0);
//   hashtagEntity_v2.protocolRevenue = BigInt.fromI32(0);
//   hashtagEntity_v2.creatorRevenue = BigInt.fromI32(0);

//   let owner_v2 = ensureOwner(event.params.creator.toHexString());
//   owner_v2.mintCount = owner_v2.mintCount.plus(ONE);
//   owner_v2.save();
//   hashtagEntity_v2.owner = owner_v2.id;

//   // publisher
//   let publisher_v2 = ensurePublisher(event.params.publisher.toHexString());
//   publisher_v2.mintCount = publisher_v2.mintCount.plus(ONE);
//   publisher_v2.save();
//   hashtagEntity_v2.publisher = publisher_v2.id;

//   // platform
//   let platform_v2 = safeLoadPlatform("platform");
//   platform_v2.save();

//   // creator
//   let creator_v2 = ensureCreator(hashtag.value1.toHexString());
//   creator_v2.mintCount = creator_v2.mintCount.plus(ONE);
//   creator_v2.save();
//   hashtagEntity_v2.creator = creator_v2.id;

//   hashtagEntity_v2.save();
