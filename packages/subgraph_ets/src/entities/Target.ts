import { Target } from "../generated/schema";
import { ETSTarget, TargetCreated } from "../generated/ETSTarget/ETSTarget";
import { ensureTargetType } from "../entities/TargetType";

export function ensureTarget(id: string, event: TargetCreated): Target {
  let target = Target.load(id);

  if (target === null && event) {
    // Ensure the target type.
    let targetContract = ETSTarget.bind(event.address);
    let targetStruct = targetContract.getTarget1(event.params.targetId);
    let targetURI = targetStruct.targetURI;
    let targetType: string[] = ensureTargetType(id, targetURI, event);

    target = new Target(id);
    target.created = event.block.timestamp;
    target.createdBy = targetStruct.createdBy.toHexString();
    target.targetURI = targetStruct.targetURI;
    target.enriched = targetStruct.enriched;
    target.httpStatus = targetStruct.httpStatus;
    target.metadataURI = targetStruct.ipfsHash;
    target.targetType = targetType[0];
    target.targetTypeKeywords = targetType;
    target.save();
  }
  return target as Target;
}
