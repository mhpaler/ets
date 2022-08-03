import { Address } from "@graphprotocol/graph-ts";
import { Transfer, ETSToken } from "../generated/ETSToken/ETSToken";
import { ONE } from "../utils/helpers";

import { ensureTag } from "../entities/Tag";
import { ensureOwner } from "../entities/Owner";
import { ensurePublisher } from "../entities/Publisher";
import { ensureCreator } from "../entities/Creator";

export function handleCreateTag(event: Transfer): void {
  let tagEntity = ensureTag(event.params.tokenId.toString(), event);
  tagEntity.save();

  // publisher
  let publisher = ensurePublisher(tagEntity.publisher, event);

  if (publisher) {
    publisher.mintCount = publisher.mintCount.plus(ONE);
    publisher.save();
  }

  let creator = ensureCreator(tagEntity.creator, event);

  if (creator) {
    creator.mintCount = creator.mintCount.plus(ONE);
    creator.save();
  }

  let owner = ensureOwner(tagEntity.owner, event);

  if (owner) {
    owner.mintCount = owner.mintCount.plus(ONE);
    owner.save();
  }
}
