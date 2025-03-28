import { BigInt as GraphBigInt, ethereum } from "@graphprotocol/graph-ts";
import { updateTargetCount } from "../entities/Platform";
import { ETSTarget } from "../generated/ETSTarget/ETSTarget";
import { Target } from "../generated/schema";
import { getTargetType } from "../utils/getTargetType";
import { getTargetTypeKeywords } from "../utils/getTargetTypeKeywords";
import { logCritical } from "../utils/logCritical";

export function ensureTarget(targetId: GraphBigInt, event: ethereum.Event): Target {
  let target = Target.load(targetId.toString());
  if (target === null && event) {
    const contract = ETSTarget.bind(event.address);
    const targetCall = contract.try_getTargetById(targetId);

    if (targetCall.reverted) {
      logCritical("getTargetById() reverted for {}", [targetId.toString()]);
    }
    target = new Target(targetId.toString());
    target.created = event.block.timestamp;
    target.createdBy = targetCall.value.createdBy.toHexString();
    target.targetURI = targetCall.value.targetURI;
    target.enriched = targetCall.value.enriched;
    target.httpStatus = targetCall.value.httpStatus;
    target.arweaveTxId = targetCall.value.arweaveTxId;
    target.targetType = getTargetType(target.targetURI);
    target.targetTypeKeywords = getTargetTypeKeywords(target.targetURI);
    target.save();

    updateTargetCount(event);
  }
  return target as Target;
}

export function updateTarget(targetId: GraphBigInt, event: ethereum.Event): Target {
  const target = ensureTarget(targetId, event);
  if (target && event) {
    const contract = ETSTarget.bind(event.address);
    const targetCall = contract.try_getTargetById(targetId);

    if (targetCall.reverted) {
      logCritical("getTargetById() reverted for {}", [targetId.toString()]);
    }

    // Update the target properties with the latest values from the contract
    target.targetURI = targetCall.value.targetURI;
    target.enriched = targetCall.value.enriched;
    target.httpStatus = targetCall.value.httpStatus;
    target.arweaveTxId = targetCall.value.arweaveTxId;

    target.save();
  }
  return target as Target;
}
