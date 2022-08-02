import { BigInt } from "@graphprotocol/graph-ts";
import { ensureTarget } from "../entities/Target";
import {
  TargetCreated,
  TargetUpdated,
  ETSTarget,
} from "../generated/ETSTarget/ETSTarget";

export function handleTargetCreated(event: TargetCreated): void {
  let target = ensureTarget(event.params.targetId.toString(), event);
  target.save();
}
