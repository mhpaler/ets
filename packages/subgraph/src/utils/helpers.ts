import { BigInt as GraphBigInt } from "@graphprotocol/graph-ts/index";
/*
 * constants for common BigInt numbers
 */
export const ONE = GraphBigInt.fromI32(1);
export const ZERO = GraphBigInt.fromI32(0);

export function toLowerCase(input: string): string {
  let lowerString = "";
  for (let i = 0; i < input.length; i++) {
    // @ts-ignore
    const inputCharAtIndex: i32 = input.charCodeAt(i);
    // @ts-ignore
    let lowercaseChar: i32;
    // A is char code 65 and Z is 90. If the char code is in this range, add 32 to make it lower case
    if (inputCharAtIndex >= 65 && inputCharAtIndex <= 90) {
      lowercaseChar = inputCharAtIndex + 32;
    } else {
      lowercaseChar = inputCharAtIndex;
    }

    lowerString = lowerString.concat(String.fromCharCode(lowercaseChar));
  }

  return lowerString;
}

/*
 * NftMetadata represents the concept of ERC721 NFT Metadata
 *
 * nftName name of the asset
 * nftDescription description of the asset
 * nftImage URI to the asset image
 */
export class NftMetadata {
  nftName: string;
  nftDescription: string;
  nftImage: string;

  constructor(nftName: string, nftDescription: string, nftImage: string) {
    this.nftName = nftName;
    this.nftDescription = nftDescription;
    this.nftImage = nftImage;
  }
}

export function getIpfsHash(uri: string | null): string | null {
  if (uri != null) {
    const parts = uri.split("/");
    const hash = parts.length > 0 ? parts[parts.length - 1] : null;

    // Check if hash is not null and starts with "Qm"
    // biome-ignore lint/complexity/useOptionalChain: <explanation>
    if (hash !== null && hash.startsWith("Qm")) {
      return hash;
    }
  }

  return null;
}
