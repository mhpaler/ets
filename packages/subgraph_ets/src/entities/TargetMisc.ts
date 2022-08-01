import { TargetMisc } from "../generated/schema";
import { ETSTarget, TargetCreated } from "../generated/ETSTarget/ETSTarget";

import { Address, ethereum } from "@graphprotocol/graph-ts";

export function ensureTargetMisc(id: string, event: TargetCreated): TargetMisc {
  let target = TargetMisc.load(id);

  if (target === null) {
    target = new TargetMisc(id);
    let targetContract = ETSTarget.bind(event.address);
    let targetStruct = targetContract.getTarget1(event.params.targetId);
    target.created = event.block.timestamp;
    target.createdBy = targetStruct.createdBy.toHexString();
    target.targetURI = targetStruct.targetURI;
    target.enriched = targetStruct.enriched;
    target.httpStatus = targetStruct.httpStatus;
    target.metadataURI = targetStruct.ipfsHash;
    target.save();
  }
  return target as TargetMisc;
}
