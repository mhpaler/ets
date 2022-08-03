import { NFT_EVM } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts/index";
import { ETS, TargetTagged } from "../generated/ETS/ETS";

export const ONE = BigInt.fromI32(1);
export const ZERO = BigInt.fromI32(0);

export function ensureNFT_EVM(
  id: string,
  registryContract: ETS,
  event: TargetTagged
): NFT_EVM | null {
  let entity = NFT_EVM.load(id);

  if (entity === null) {
    entity = new NFT_EVM(id);
    let targetURI = registryContract.targets(BigInt.fromString(id)).value1;
    let split = targetURI.split("|");
    entity.nftContract = split[0];
    entity.nftId = split[1];
    entity.nftChainId = BigInt.fromString(split[2]);
    //need to update appropriately for timestamp
    entity.timestamp = event.block.timestamp;
    entity.save();
  }

  return entity;
}
