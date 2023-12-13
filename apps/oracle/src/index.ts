import { AbiEvent } from "abitype";
import { publicClient, walletClient, account } from "./client.ts";
import { etsAuctionHouseConfig } from "./contracts.ts"; //const auctionsMaxSetEvent = etsAuctionHouseConfig.abi.find(
import axios, { AxiosResponse } from "axios";

const requestCreateAuction = etsAuctionHouseConfig.abi.find(
  (item) => item.type === "event" && item.name === "RequestCreateAuction"
) as AbiEvent;

if (!requestCreateAuction) {
  console.error("RequestCreateAuction event not found in ABI");
  process.exit(1);
}

console.log("Watching for RequestCreateAuction event...");
console.log("Event ABI:", requestCreateAuction);

const GRAPH_API_ENDPOINT = "http://localhost:8000/subgraphs/name/ets/ets-local";

interface CTAG {
  id: string;
  display: string;
}

async function findNextCTAG(): Promise<string> {
  try {
    const query = `
      query {
        tags(
          first: 1
          orderBy: timestamp
          orderDirection: asc
          where: {owner_: {id: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"}}
        ) {
          id
          display
        }
      }
    `;

    const response: AxiosResponse<{ data: { tags: CTAG[] } }> =
      await axios.post(GRAPH_API_ENDPOINT, { query });
    const nextCTAG = response.data.data.tags[0];

    console.log(
      `Next token to release ${nextCTAG.display} with id ${nextCTAG.id}`
    );
    return nextCTAG.id;
  } catch (error: any) {
    console.error("Error querying The Graph:", error.message);
    throw error;
  }
}

await findNextCTAG();

const unwatchRequestCreateAuction = publicClient.watchEvent({
  address: etsAuctionHouseConfig.address,
  event: requestCreateAuction,
  onLogs: async (logs) => {
    // TODO: review logs to verify block, address & transactionHash of event?
    console.log(logs);
    try {
      // Find the oldest CTAG owned by ETS
      const tokenId = await findNextCTAG();
      const { request } = await publicClient.simulateContract({
        account,
        address: etsAuctionHouseConfig.address,
        abi: etsAuctionHouseConfig.abi,
        functionName: "fulfillRequestCreateAuction",
        args: [BigInt(tokenId)],
      });

      const response = await walletClient.writeContract(request);
      console.log(`Next token successfully released. Txn Hash: ${response}`);
    } catch (error: any) {
      console.error("An unexpected error occurred: ", error.message);
    }
  },
  onError: (error) => {
    console.error("Error:", error);
  },
});

// Handle graceful shutdown (e.g., with Ctrl+C)
process.on("SIGINT", () => {
  unwatchRequestCreateAuction();
  console.log("requestCreateAuction Service terminated.");
  process.exit();
});
