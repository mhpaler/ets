import { TargetTypeBlink, TargetTypeMisc } from "../generated/schema";

import { TargetCreated } from "../generated/ETSTarget/ETSTarget";

export function ensureTargetType(
  id: string,
  targetURI: string,
  event: TargetCreated
): string[] {
  let parts = targetURI.split(":");

  if (parts.length > 0 && parts[0] == "blink") {
    // We have a blink
    // blink:[chain-name]:[chain-network]:[block]:[transaction]
    //"blink:polygon:mumbai:0x60Ae865ee4C725cd04353b5AAb364553f56ceF82:0x8635-0x0b"
    let targetType = TargetTypeBlink.load(id);
    let terms: string[] = [];
    if (targetType === null) {
      targetType = new TargetTypeBlink(event.params.targetId.toString());
      targetType.typeName = "Blink";
      targetType.chainName = parts[1];
      targetType.chainNetwork = parts[2];
      // ChainAssetId is everything after chainNetwork.
      targetType.chainAssetId = parts.slice(3, parts.length).join(":");

      // Here we should do some introspection on the Blink to add additional color.
      // for now, this will be 100% procedural for the purposes of identifying
      // Lens Publications.
      const arr: string[] = [
        "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d", // mainnet
        "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82", // mumbai
      ];

      // Assuming this is a Lens publication
      if (arr.includes(parts[3])) {
        targetType.chainAssetType = "Record";
        targetType.chainAssetSubtype = "Lens Publication";
      }
      targetType.save();
      terms = [
        targetType.id,
        targetType.typeName,
        targetType.chainName,
        targetType.chainNetwork,
        targetType.chainAssetId,
        targetType.chainAssetType,
        targetType.chainAssetSubtype,
      ];
    }
    return terms;
  } else {
    // we have a TargetMisc
    let terms: string[] = [];
    let targetType = TargetTypeMisc.load(id);
    if (targetType === null) {
      targetType = new TargetTypeMisc(event.params.targetId.toString());
      targetType.typeName = "Miscellaneous";
      targetType.save();
      terms = [targetType.id, targetType.typeName];
    }
    return terms;
  }
}
