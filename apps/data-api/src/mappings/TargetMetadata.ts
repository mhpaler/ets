import { Bytes, dataSource, log } from "@graphprotocol/graph-ts";
import { Target, TargetMetadata } from "../generated/schema";

export function handleTargetMetadata(content: Bytes): void {
  // Get the Arweave transaction ID
  const arweaveTxId = dataSource.stringParam();
  const context = dataSource.context();

  // Get values from context
  const targetId = context.getString("targetId");

  // For POC, just store the raw data without trying to link to a target
  const metadata = new TargetMetadata(arweaveTxId);
  metadata.rawData = content.toString();
  metadata.target = targetId;
  metadata.timestamp = context.getBigInt("timestamp");
  metadata.save();

  /*   const target = Target.load(targetId);
  if (target) {
    target.currentMetadata = arweaveTxId;
    target.save();
  } else {
    log.warning("Target not found for ID: {}", [targetId]);
    // Additional fallback logic if needed
  } */
}
