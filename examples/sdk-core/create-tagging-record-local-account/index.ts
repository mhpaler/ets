import { createRelayerClient } from "@ethereum-tag-service/sdk-core";
import { http, createPublicClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

// Generate private key and Tagger account only once
const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);
const accountAddress = account.address;

// Initialize publicClient only once
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function runDemo(): Promise<{ result: string; link?: string }> {
  const accountBalance = await publicClient.getBalance({
    address: accountAddress,
  });

  if (accountBalance === 0n) {
    return {
      result: `Send .00001 Base Sepolia ETH to the following address: ${accountAddress} then click 'Run Demo' again.`,
    };
  }

  const relayerClient = createRelayerClient({
    chainId: baseSepolia.id,
    relayerAddress: "0x34b5E2B38E9A5F938bc6De795b5Fb69982a4D73e", // baseSepolia
    account,
  });

  if (!relayerClient) {
    throw new Error("Failed to initialize relayer client");
  }

  try {
    const taggingRecord = await relayerClient.createTaggingRecord(
      ["#rainbow", "#unicorn"],
      "https://app.uniswap.org",
      "example",
    );

    const link = `https://app.ets.xyz/explore/tagging-records/${taggingRecord.taggingRecordId}`;

    return {
      result: `Tagging record created: ${JSON.stringify(taggingRecord, null, 2)}`,
      link,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        result: `Error creating tagging record: ${error.message}`,
      };
    }
    return {
      result: `An unexpected error occurred: ${String(error)}`,
    };
  }
}
