import { createPublicClient, http, createWalletClient } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

// TODO: Pull this from the monorepo root .env file, ideally, loading it at ../index.ts
const mnemonic = "test test test test test test test test test test test junk";
// const oraclePK =
//   "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

console.log("mnemonic", mnemonic);

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

export const walletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});

// Local mnemonic index 1 has oracle permissions.
// See namedAccounts in /packages/contracts/hardhat.config.ts
// and See /packages/contracts/deploy/deploy.js where role is given.
export const account = mnemonicToAccount(mnemonic, {
  accountIndex: 0,
  addressIndex: 1,
});
