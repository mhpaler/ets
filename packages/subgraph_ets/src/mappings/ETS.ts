// import { BigInt, Bytes, ipfs, json, JSONValue } from "@graphprotocol/graph-ts";
// import { log } from "@graphprotocol/graph-ts";

import { TaggingRecordCreated, ETS } from "../generated/ETS/ETS";
import { ETSToken } from "../generated/ETSToken/ETSToken";
import { ETSAccessControls } from "../generated/ETSAccessControls/ETSAccessControls";
import { TaggingRecord } from "../generated/schema";

import { ONE } from "../utils/helpers";

import { ensurePlatform } from "../entities/Platform";
import { ensurePublisher } from "../entities/Publisher";
import { ensureTagger } from "../entities/Tagger";
import { ensureCreator } from "../entities/Creator";
import { ensureOwner } from "../entities/Owner";
import { ensureTag } from "../entities/Tag";
import { ensureTarget } from "../entities/Target";
import { log } from "@graphprotocol/graph-ts";

export function handleTaggingRecordCreated(event: TaggingRecordCreated): void {
  let ets = ETS.bind(event.address);
  let tagFee = ets.taggingFee();
  let taggingRecordResponse = ets.getTaggingRecordFromId(
    event.params.taggingRecordId
  );

  let modulo = ets.modulo();
  let platformPercentageOfTagFee = ets.platformPercentage();
  let publisherPercentageOfTagFee = ets.publisherPercentage();
  let remainingPercentage = modulo
    .minus(platformPercentageOfTagFee)
    .minus(publisherPercentageOfTagFee);

  let etsAccessControls = ETSAccessControls.bind(ets.etsAccessControls());
  let etsToken = ETSToken.bind(ets.etsToken());
  let platformAddress = etsAccessControls.getPlatformAddress();

  let tags = taggingRecordResponse.getTagIds();

  let publisherFee = tagFee.times(publisherPercentageOfTagFee).div(modulo);
  let platformFee = tagFee.times(platformPercentageOfTagFee).div(modulo);
  let remainingFee = tagFee.times(remainingPercentage).div(modulo);

  const tagIDList: string[] = [];
  for (let i = 0; i < tags.length; i++) {
    let ctag = ensureTag(tags[i].toString(), null);
    let owner = etsToken.ownerOf(tags[i]);

    if (owner.equals(platformAddress)) {
      // Tag is owned by platform.
      if (ctag) {
        ctag.creatorRevenue = ctag.creatorRevenue.plus(remainingFee);

        //  Update creator counts and fees
        let creator = etsToken.getCreatorAddress(tags[i]);
        let creatorEntity = ensureCreator(creator.toHexString(), event);

        if (creatorEntity) {
          creatorEntity.tagCount = creatorEntity.tagCount.plus(ONE);
          creatorEntity.tagFees = creatorEntity.tagFees.plus(remainingFee);
          creatorEntity.save();
        }
      }
    } else {
      if (ctag) {
        ctag.ownerRevenue = ctag.ownerRevenue.plus(remainingFee);

        // Update owner counts and fees
        let ownerEntity = ensureOwner(owner.toHexString(), event);

        if (ownerEntity) {
          ownerEntity.tagCount = ownerEntity.tagCount.plus(ONE);
          ownerEntity.tagFees = ownerEntity.tagFees.plus(remainingFee);
          ownerEntity.save();
        }
      }
    }

    // Update rest of tag data
    if (ctag) {
      ctag.tagCount = ctag.tagCount.plus(ONE);
      ctag.publisherRevenue = ctag.publisherRevenue.plus(publisherFee);
      ctag.protocolRevenue = ctag.protocolRevenue.plus(platformFee);
      ctag.save();
      tagIDList.push(ctag.id.toString());
    }
  }

  let targetID = taggingRecordResponse.getTargetId().toString();

  // Store tag information
  let taggingRecord = new TaggingRecord(
    event.params.taggingRecordId.toString()
  );

  if (taggingRecord && tags.length > 0) {
    taggingRecord.tags = tagIDList;
    taggingRecord.target = targetID;
    taggingRecord.recordType = taggingRecordResponse.getRecordType();
    taggingRecord.tagger = taggingRecordResponse.getTagger().toHexString();
    taggingRecord.publisher = taggingRecordResponse
      .getPublisher()
      .toHexString();
    taggingRecord.timestamp = event.block.timestamp;
    taggingRecord.save();
  }

  // update publisher counts and fees
  let publisherEntity = ensurePublisher(
    taggingRecordResponse.getPublisher(),
    event
  );

  if (publisherEntity) {
    publisherEntity.tagCount = publisherEntity.tagCount.plus(ONE);
    publisherEntity.tagFees = publisherEntity.tagFees.plus(publisherFee);
    publisherEntity.save();
  }

  // update platform fees
  let platform = ensurePlatform(platformAddress, event);

  if (platform) {
    platform.tagFees = platform.tagFees.plus(platformFee);
    platform.save();
  }

  // update tagger counts
  let tagger = ensureTagger(
    taggingRecordResponse.getTagger().toHexString(),
    event
  );

  if (tagger) {
    tagger.tagCount = tagger.tagCount.plus(ONE);
    tagger.feesPaid = tagger.feesPaid.plus(tagFee);
    let items = tagger.tags.concat(tagIDList);
    //log.info('My value is: {}', [items])
    tagger.tags = items;

    tagger.save();
  }
}
