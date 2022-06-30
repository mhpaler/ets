// // import { BigInt, Bytes, ipfs, json, JSONValue } from "@graphprotocol/graph-ts";
// // import { log } from "@graphprotocol/graph-ts";

// import { TargetTagged,  ETS} from "../generated/ETS/ETS";
// import { ETSTag } from "../generated/ETSTag/ETSTag";
// import { Tag, Tagging_Record, Target, NFT_EVM } from "../generated/schema";

// import {
//   toLowerCase,
//   safeLoadPublisher,
//   safeLoadPlatform,
//   safeLoadOwner,
//   safeLoadTagger,
//   safeLoadCreator,
//   ONE,
// } from "../utils/helpers";


// export function handleTargetpdated(event: TargetUpdated): void {
//   let registryContract = ETS.bind(event.address);
//   //pull target data from smart contract
//   //update target in subgraph with data from contract
//   Target.get
// }