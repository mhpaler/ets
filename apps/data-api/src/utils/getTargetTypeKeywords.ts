export function getTargetTypeKeywords(uri: string): string[] {
  const parts = uri.split(":");

  if (parts.length > 0) {
    if (parts[0].toLowerCase() === "blink") {
      // blink:[chain-name]:[chain-network]:[block]:[transaction]
      // blink:polygon:mumbai:0x60Ae865ee4C725cd04353b5AAb364553f56ceF82:0x8635-0x0b"
      // https://lenster.xyz/posts/0x8635-0x17
      // blink:polygon:mainnet:0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d:0x8635-0x17"
      const typeName = "Blink";
      const chainName = parts[1];
      const chainNetwork = parts[2];
      // ChainAssetId is everything after chainNetwork.
      const chainAssetId = parts.slice(3, parts.length).join(":");
      // Here we should do some introspection on the Blink to add additional color.
      // for now, this will be 100% procedural for the purposes of identifying
      // Lens Publications.
      const arr: string[] = [
        "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d", // mainnet
        "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82", // mumbai
      ];

      let chainAssetType = "UNKNOWN";
      let chainAssetSubtype = "UNKNOWN";
      // Assuming this is a Lens publication
      if (arr.includes(parts[3])) {
        chainAssetType = "RECORD";
        chainAssetSubtype = "Lens Publication";
      }

      const terms: string[] = [typeName, chainName, chainNetwork, chainAssetId, chainAssetType, chainAssetSubtype];
      return terms;
    }

    if (parts[0] === "https" || parts[0] === "http") {
      return ["URL"];
    }

    return ["UNKNOWN"];
  }

  return ["UNKNOWN"];
}
