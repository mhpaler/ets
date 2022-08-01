import { BigInt } from "@graphprotocol/graph-ts";
import { ensureTargetMisc } from "../entities/TargetMisc";
import {
  TargetCreated,
  TargetUpdated,
  ETSTarget,
} from "../generated/ETSTarget/ETSTarget";

export function handleTargetCreated(event: TargetCreated): void {
  //let target = new TargetMisc();
  let targetContract = ETSTarget.bind(event.address);
  let targetStruct = targetContract.getTarget1(event.params.targetId);

  let targetURI = targetStruct.targetURI;

  // TODO: Introspect on targetURI
  let split = targetURI.split(":");
  if (split.length > 0 && split[0] == "blink") {
    // We have a blink
    // ensure on lens publication.
  } else {
    // we have a TargetMisc
    let target = ensureTargetMisc(event.params.targetId.toString(), event);
    target.save();
  }
}
