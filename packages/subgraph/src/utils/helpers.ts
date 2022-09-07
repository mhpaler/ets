import {Creator, Owner, Platform, Publisher, Tagger} from "../generated/schema";
import {BigInt, Bytes, ipfs, json, JSONValue} from "@graphprotocol/graph-ts/index";

/*
 * constants for common BigInt numbers
 */
export const ONE = BigInt.fromI32(1);
export const ZERO = BigInt.fromI32(0);

export function toLowerCase(input: string): string {
    let lowerString: string = ""
    for(let i = 0; i < input.length; i++) {
        let inputCharAtIndex: i32 = input.charCodeAt(i)

        let lowercaseChar: i32
        // A is char code 65 and Z is 90. If the char code is in this range, add 32 to make it lower case
        if (inputCharAtIndex >= 65 && inputCharAtIndex <= 90) {
            lowercaseChar = inputCharAtIndex + 32
        } else {
            lowercaseChar = inputCharAtIndex
        }

        lowerString = lowerString.concat(String.fromCharCode(lowercaseChar))
    }

    return lowerString
}

/*
 * Safely loads (and initialises if needed) an Owner entity
 *
 * id identifer; in this case the Ethereum account
 */
export function safeLoadOwner(id: string): Owner | null {
    let entity = Owner.load(id);

    if (entity === null) {
        entity = new Owner(id);
        entity.mintCount = ZERO;
        entity.tagCount = ZERO;
        entity.tagFees = ZERO;
    }

    return entity;
}

/*
 * Safely loads (and initialises if needed) an Publisher entity
 *
 * id identifer; in this case the Ethereum account
 */
export function safeLoadPublisher(id: string): Publisher | null {
    let entity = Publisher.load(id);

    if (entity === null) {
        entity = new Publisher(id);
        entity.mintCount = ZERO;
        entity.tagCount = ZERO;
        entity.tagFees = ZERO;
    }

    return entity;
}

/*
 * Safely loads (and initialises if needed) the Platform entity
 *
 * Note: Should only ever be one plaform entity
 *
 * id identifer; a single known key is commonly used.
 */
export function safeLoadPlatform(id: string): Platform | null {
    let entity = Platform.load(id);

    if (entity === null) {
        entity = new Platform(id);
        entity.tagFees = ZERO;
    }

    return entity;
}

/*
 * Safely loads (and initialises if needed) an Tagger entity
 *
 * Note: A Tagger is the person who made a tag with an existing Hashtag entity
 *
 * id identifer; in this case the Ethereum account
 */
export function safeLoadTagger(id: string): Tagger | null {
    let entity = Tagger.load(id);

    if (entity === null) {
        entity = new Tagger(id);
        entity.tagCount = ZERO;
        entity.feesPaid = ZERO;
    }

    return entity;
}

/*
 * Safely loads (and initialises if needed) an Creator entity
 *
 * Note: A Creator is the person who made the first instance of a tag
 *
 * id identifer; in this case the Ethereum account
 */
export function safeLoadCreator(id: string): Creator | null {
    let entity = Creator.load(id);

    if (entity === null) {
        entity = new Creator(id);
        entity.mintCount = ZERO;
        entity.tagCount = ZERO;
        entity.tagFees = ZERO;
    }

    return entity;
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

/*
 * Looks up IPFS metadata safely using the NFT's token URI string
 *
 * Note: this is defensive as some links may fail or not contain data
 *
 * tokenUri location of the metadata in IPFS
 */
export function extractNftIPFSMetadata(tokenUri: string): NftMetadata | null {
  let ipfsHash = getIpfsHash(tokenUri);

  if (ipfsHash != null) {
    let data = ipfs.cat('/ipfs/' + ipfsHash);

    if (data !== null) {
      let jsonData: JSONValue = json.fromBytes(data as Bytes);

      let nftName = jsonData.toObject().get('name').toString();
      let nftDescription = jsonData.toObject().get('description').toString();
      let nftImage = jsonData.toObject().get('image').toString();

      return new NftMetadata(nftName, nftDescription, nftImage);
    }
  }
  else {
    let msg = '--';
    let nftImage = 'https://icon-library.com/images/no-image-available-icon/no-image-available-icon-12.jpg';
    return new NftMetadata(msg, msg, nftImage);
  }

  return null;
}

export function getIpfsHash(uri: string | null): string | null {
  if (uri != null) {
    let hash = uri.split('/').pop()

    if (hash != null && hash.startsWith('Qm')) {
      return hash
    }
  }

  return null
}
