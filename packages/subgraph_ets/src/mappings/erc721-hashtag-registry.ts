// import { BigInt, Bytes, ipfs, json, JSONValue } from "@graphprotocol/graph-ts";
// import { log } from "@graphprotocol/graph-ts";

import { HashtagRegistered, ERC721HashtagRegistry } from "../generated/ERC721HashtagRegistry/ERC721HashtagRegistry";
import { HashtagProtocol } from "../generated/HashtagProtocol/HashtagProtocol";
import { Tag, Hashtag, Tag_v2, Hashtag_v2, NFT_v2 } from "../generated/schema";
import { ensureCreator } from '../entities/Creator';
import { ensurePublisher } from '../entities/Publisher';
import { ensureOwner } from '../entities/Owner';
import { ensureTagger } from '../entities/Tagger';
import { ensurePlatform } from '../entities/Platform';

import {
  toLowerCase,
  safeLoadPublisher,
  safeLoadPlatform,
  safeLoadOwner,
  safeLoadTagger,
  safeLoadCreator,
  ONE,
  extractNftIPFSMetadata,
} from "../utils/helpers";


/*
 * Track the tagging of an NFT asset
 *
 * event.params.hashtagId NFT ID of the hashtag
 * event.params.nftContract Contract address of the NFT asset being tagged
 * event.params.nftId NFT ID of the NFT asset being tagged
 * event.params.tagger Ethereum address that initiated the tag
 * event.params.publisher Publisher that facilitated the tag
 * event.params.tagFee Fee earned by the Hashtag Protocol
 * event.params.nftChainId Chain Id the target nft is on
 *
 * Notes
 *    A number of data points are generated off the back of this tagging event:
 *     - Tag / usage count for a hashtag
 *     - Tagging fees earned by the hashtag owner, publisher and platform
 */
export function handleHashtagRegistered(event: HashtagRegistered): void {
  let registryContract = ERC721HashtagRegistry.bind(event.address);
  let tagFee = event.params.tagFee;

  let modulo = registryContract.modulo();
  let platformPercentageOfTagFee = registryContract.platformPercentage();
  let publisherPercentageOfTagFee = registryContract.publisherPercentage();
  let remainingPercentage = modulo.minus(platformPercentageOfTagFee).minus(publisherPercentageOfTagFee);

  let protocolAddress = registryContract.hashtagProtocol();
  let protocolContract = HashtagProtocol.bind(protocolAddress);
  let platformAddress = protocolContract.platform();

  let hashtagId = event.params.hashtagId;
  let owner = protocolContract.ownerOf(hashtagId);

  let publisherFee = tagFee.times(publisherPercentageOfTagFee).div(modulo);
  let platformFee = tagFee.times(platformPercentageOfTagFee).div(modulo);
  let remainingFee = tagFee.times(remainingPercentage).div(modulo);

  let hashtag = Hashtag.load(hashtagId.toString());

  // this is a pre-auction state if true or post-auction if false
  if (owner.equals(platformAddress)) {
    hashtag.creatorRevenue = hashtag.creatorRevenue.plus(remainingFee);

    //  Update creator counts and fees
    let creator = protocolContract.getCreatorAddress(hashtagId);
    let creatorEntity = safeLoadCreator(creator.toHexString());
    creatorEntity.tagCount = creatorEntity.tagCount.plus(ONE);
    creatorEntity.tagFees = creatorEntity.tagFees.plus(remainingFee);
    creatorEntity.save();
  } else {
    hashtag.ownerRevenue = hashtag.ownerRevenue.plus(remainingFee);

    // Update owner counts and fees
    let ownerEntity = safeLoadOwner(owner.toHexString());
    ownerEntity.tagCount = ownerEntity.tagCount.plus(ONE);
    ownerEntity.tagFees = ownerEntity.tagFees.plus(remainingFee);
    ownerEntity.save();
  }

  // Update rest of hashtag data
  hashtag.tagCount = hashtag.tagCount.plus(ONE);
  hashtag.publisherRevenue = hashtag.publisherRevenue.plus(publisherFee);
  hashtag.protocolRevenue = hashtag.protocolRevenue.plus(platformFee);
  hashtag.save();

  // Store tag information
  let tagEntity = new Tag(event.params.tagId.toString());
  tagEntity.transaction = event.transaction.hash.toHexString();
  tagEntity.hashtagId = hashtagId.toString();
  tagEntity.nftContract = event.params.nftContract;
  tagEntity.nftId = event.params.nftId.toString();
  tagEntity.nftChainId = event.params.nftChainId;
  tagEntity.tagger = event.params.tagger;
  tagEntity.timestamp = event.block.timestamp;
  tagEntity.publisher = event.params.publisher;
  tagEntity.hashtagDisplayHashtag = hashtag.displayHashtag;
  let lowerHashtag = toLowerCase(hashtag.displayHashtag);
  tagEntity.hashtag = lowerHashtag;
  tagEntity.hashtagWithoutHash = lowerHashtag.substring(1, lowerHashtag.length);
  tagEntity.save();

  // let erc721Contract = HashtagProtocol.bind(event.params.nftContract);
  // tagEntity.nftContractName = erc721Contract.name();
  // let tokenUriCallResult = erc721Contract.try_tokenURI(event.params.nftId);
  // tagEntity.nftTokenUri = tokenUriCallResult.reverted ? null : tokenUriCallResult.value;
  // if (!tokenUriCallResult.reverted) {
  //  let nftMetadata = extractNftIPFSMetadata(tagEntity.nftTokenUri);
  //  if (nftMetadata) {
  //    tagEntity.nftName = nftMetadata.nftName;
  //    tagEntity.nftDescription = nftMetadata.nftDescription;
  //    tagEntity.nftImage = nftMetadata.nftImage;
  //  }
  // }

  // update publisher counts and fees
  let publisherEntity = safeLoadPublisher(event.params.publisher.toHexString());
  publisherEntity.tagCount = publisherEntity.tagCount.plus(ONE);
  publisherEntity.tagFees = publisherEntity.tagFees.plus(publisherFee);
  publisherEntity.save();

  // update platform fees
  let platform = safeLoadPlatform("platform");
  platform.tagFees = platform.tagFees.plus(platformFee);
  platform.save();

  // update tagger counts
  let tagger = safeLoadTagger(event.params.tagger.toHexString());
  tagger.tagCount = tagger.tagCount.plus(ONE);
  tagger.feesPaid = tagger.feesPaid.plus(tagFee);
  tagger.save();

  ////////////////////////////////////////////////////////////
  //// version 2
  ////////////////////////////////////////////////////////////
  let registryContract_v2 = ERC721HashtagRegistry.bind(event.address);
  let tagFee_v2 = event.params.tagFee;

  let modulo_v2 = registryContract.modulo();
  let platformPercentageOfTagFee_v2 = registryContract_v2.platformPercentage();
  let publisherPercentageOfTagFee_v2 = registryContract_v2.publisherPercentage();
  let remainingPercentage_v2 = modulo.minus(platformPercentageOfTagFee).minus(publisherPercentageOfTagFee);

  let protocolAddress_v2 = registryContract_v2.hashtagProtocol();
  let protocolContract_v2 = HashtagProtocol.bind(protocolAddress_v2);
  let platformAddress_v2 = protocolContract_v2.platform();

  let hashtagId_v2 = event.params.hashtagId;
  let owner_v2 = protocolContract_v2.ownerOf(hashtagId_v2);

  let publisherFee_v2 = tagFee_v2.times(publisherPercentageOfTagFee_v2).div(modulo_v2);
  let platformFee_v2 = tagFee_v2.times(platformPercentageOfTagFee_v2).div(modulo_v2);
  let remainingFee_v2 = tagFee_v2.times(remainingPercentage_v2).div(modulo_v2);

  let hashtag_v2 = Hashtag_v2.load(hashtagId_v2.toString());

  // this is a pre-auction state if true or post-auction if false
  if (owner_v2.equals(platformAddress_v2)) {
    hashtag_v2.creatorRevenue = hashtag_v2.creatorRevenue.plus(remainingFee_v2);

    //  Update creator counts and fees
    let creator_v2 = protocolContract_v2.getCreatorAddress(hashtagId_v2);
    let creatorEntity_v2 = ensureCreator(creator_v2.toHexString());
    creatorEntity_v2.tagCount = creatorEntity_v2.tagCount.plus(ONE);
    creatorEntity_v2.tagFees = creatorEntity_v2.tagFees.plus(remainingFee_v2);
    creatorEntity_v2.save();
  } else {
    hashtag_v2.ownerRevenue = hashtag_v2.ownerRevenue.plus(remainingFee_v2);

    // Update owner counts and fees
    let ownerEntity_v2 = ensureOwner(owner.toHexString());
    ownerEntity_v2.tagCount = ownerEntity_v2.tagCount.plus(ONE);
    ownerEntity_v2.tagFees = ownerEntity_v2.tagFees.plus(remainingFee_v2);
    ownerEntity_v2.save();
  }

  // Update rest of hashtag data
  hashtag_v2.tagCount = hashtag_v2.tagCount.plus(ONE);
  hashtag_v2.publisherRevenue = hashtag_v2.publisherRevenue.plus(publisherFee_v2);
  hashtag_v2.protocolRevenue = hashtag.protocolRevenue.plus(platformFee_v2);
  hashtag_v2.save();

  //create the NFT entity

  let nft_v2 = new NFT_v2(event.params.tagId.toString());
  nft_v2.nftContract = event.params.nftContract;
  nft_v2.nftId = event.params.nftId.toString();
  nft_v2.nftChainId = event.params.nftChainId;
  nft_v2.timestamp = event.block.timestamp;
  nft_v2.save();

  // Store tag information
  let tagEntity_v2 = new Tag_v2(event.params.tagId.toString());
  tagEntity_v2.transaction = event.transaction.hash.toHexString();
  tagEntity_v2.hashtag = hashtag_v2.id;
  tagEntity_v2.target = nft_v2.id;
  tagEntity_v2.hashtagName = hashtag_v2.hashtag;

  

  // let erc721Contract = HashtagProtocol.bind(event.params.nftContract);
  // tagEntity.nftContractName = erc721Contract.name();
  // let tokenUriCallResult = erc721Contract.try_tokenURI(event.params.nftId);
  // tagEntity.nftTokenUri = tokenUriCallResult.reverted ? null : tokenUriCallResult.value;
  // if (!tokenUriCallResult.reverted) {
  //  let nftMetadata = extractNftIPFSMetadata(tagEntity.nftTokenUri);
  //  if (nftMetadata) {
  //    tagEntity.nftName = nftMetadata.nftName;
  //    tagEntity.nftDescription = nftMetadata.nftDescription;
  //    tagEntity.nftImage = nftMetadata.nftImage;
  //  }
  // }

  // update publisher counts and fees
  let publisherEntity_v2 = ensurePublisher(event.params.publisher.toHexString());
  publisherEntity_v2.tagCount = publisherEntity_v2.tagCount.plus(ONE);
  publisherEntity_v2.tagFees = publisherEntity_v2.tagFees.plus(publisherFee_v2);
  publisherEntity_v2.save();

  tagEntity_v2.publisher = publisherEntity_v2.id;

  // update platform fees
  let platform_v2 = ensurePlatform("platform");
  platform_v2.tagFees = platform_v2.tagFees.plus(platformFee_v2);
  platform_v2.save();
  

  // update tagger counts
  let tagger_v2 = ensureTagger(event.params.tagger.toHexString());
  tagger_v2.tagCount = tagger_v2.tagCount.plus(ONE);
  tagger_v2.feesPaid = tagger_v2.feesPaid.plus(tagFee_v2);
  tagger_v2.save();

  tagEntity_v2.tagger = tagger_v2.id;



  tagEntity_v2.save();
}
