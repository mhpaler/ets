import { http, createPublicClient } from "viem";
import { localhost } from "viem/chains";
import { keccak256, toBytes } from "viem/utils";

const client = createPublicClient({
  chain: { ...localhost, id: 31337 },
  transport: http("http://localhost:8545"),
});

async function checkTarget() {
  const targetURI = "https://www.ethereum.org/en/developers/";
  const targetId = keccak256(toBytes(targetURI));

  console.log("Target URI:", targetURI);
  console.log("Target ID:", targetId);

  // Check if target exists by calling getTargetById
  try {
    const etsTargetAbi = [
      "function getTargetById(uint256 _targetId) view returns (string targetURI, address createdBy, uint256 enriched, uint256 httpStatus, string arweaveTxId)",
    ];

    const result = await client.readContract({
      address: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
      abi: etsTargetAbi,
      functionName: "getTargetById",
      args: [BigInt(targetId)],
    });

    console.log("\nTarget exists!");
    console.log("Target data:", result);
  } catch (error) {
    console.log("\nTarget does not exist or error:", error.message);
  }
}

checkTarget();
