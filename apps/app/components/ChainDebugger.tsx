import { getEnvironment } from "@app/utils/getEnvironment";
import { getAlchemyRpcUrlById } from "@ethereum-tag-service/contracts/utils";
import subgraphEndpoints from "@ethereum-tag-service/subgraph-endpoints";
import type { FC } from "react";
import { useEffect } from "react";
import { useAccount, useChainId, useConfig, usePublicClient } from "wagmi";

const ChainDebugger: FC = () => {
  const config = useConfig();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  // Early return if publicClient is undefined
  if (!publicClient) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg mt-8 text-sm">
        <h3 className="font-bold mb-2">Debug Information</h3>
        <p>Public client is not available.</p>
      </div>
    );
  }

  // Get the connected chain from config based on chainId
  const correctChain = config.chains.find((c) => c.id === chainId);
  const publicClientChain = config.chains.find((c) => c.id === publicClient.chain.id);

  // Get the environment based on the detected chain ID
  const environment = getEnvironment(publicClient.chain.id.toString());

  // Get the GraphQL endpoint
  const graphqlEndpoint = subgraphEndpoints[environment as keyof typeof subgraphEndpoints];

  // Get the RPC URL based on the public client chain ID
  const rpcUrl =
    publicClient.chain.id === 31337 || publicClient.chain.id === 1337
      ? "http://localhost:8545"
      : getAlchemyRpcUrlById(publicClient.chain.id.toString(), process.env.NEXT_PUBLIC_ALCHEMY_KEY || "");

  // Log the exact hostname to verify it’s being interpreted correctly
  const hostname = typeof window !== "undefined" ? window.location.hostname : "Server-side";
  const currentSubdomain = hostname.split(".")[0].toLowerCase();

  // Logging for debugging purposes
  /*   useEffect(() => {
    console.info("Raw Hostname:", hostname);
    console.info("Detected Subdomain:", currentSubdomain);
    console.info("Expected Chain from Wagmi (useChainId):", correctChain?.name, "(ID:", correctChain?.id, ")");
    console.info("Public Client Chain (usePublicClient):", publicClientChain?.name, "(ID:", publicClient.chain.id, ")");
    console.info("Environment:", environment);
    console.info("GraphQL Endpoint:", graphqlEndpoint);
    console.info("RPC URL:", rpcUrl);
  }, [
    hostname,
    currentSubdomain,
    correctChain,
    publicClientChain,
    publicClient.chain.id,
    environment,
    graphqlEndpoint,
    rpcUrl,
  ]); */

  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-8 text-sm">
      <h3 className="font-bold mb-2">Debug Information</h3>
      <ul>
        <li>
          <strong>Expected Chain (useChainId):</strong> {correctChain?.name || "Not connected"} (ID:{" "}
          {correctChain?.id || "N/A"})
        </li>
        <li>
          <strong>Public Client Chain (usePublicClient):</strong> {publicClientChain?.name || "Not connected"} (ID:{" "}
          {publicClient.chain.id || "N/A"})
        </li>
        <li>
          <strong>Environment:</strong> {environment}
        </li>
        <li>
          <strong>Current Subdomain:</strong> {currentSubdomain}
        </li>
        <li>
          <strong>GraphQL Endpoint:</strong> {graphqlEndpoint || "Not available"}
        </li>
        <li>
          <strong>RPC URL:</strong> {rpcUrl}
        </li>
        <li>
          <strong>Full Hostname:</strong> {hostname}
        </li>
        <li>
          <strong>Connection Status:</strong> {isConnected ? "Connected" : "Not connected"}
        </li>
      </ul>
    </div>
  );
};

export default ChainDebugger;
