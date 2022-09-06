import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Target } from "../generated/schema";
import { ETSTarget } from "../generated/ETSTarget/ETSTarget";
import { getTargetType } from "../utils/getTargetType";
import { getTargetTypeKeywords } from "../utils/getTargetTypeKeywords";
import { logCritical } from "../utils/logCritical";

export function ensureTarget(targetId: BigInt, event: ethereum.Event): Target {
  let target = Target.load(targetId.toString());
  if (target === null && event) {
    let contract = ETSTarget.bind(event.address);
    let targetCall = contract.try_getTargetById(targetId);

    if (targetCall.reverted) {
      logCritical("getTargetById() reverted for {}", [targetId.toString()]);
    }
    target = new Target(targetId.toString());
    target.created = event.block.timestamp;
    target.createdBy = targetCall.value.createdBy.toHexString();
    target.targetURI = targetCall.value.targetURI;
    target.enriched = targetCall.value.enriched;
    target.httpStatus = targetCall.value.httpStatus;
    target.metadataURI = targetCall.value.ipfsHash;
    target.targetType = getTargetType(target.targetURI);
    target.targetTypeKeywords = getTargetTypeKeywords(target.targetURI);
    target.save();
  }
  return target as Target;
}
