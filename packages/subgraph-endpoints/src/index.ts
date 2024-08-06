const subgraphEndpoints: Record<string, string> = {
  development: "http://localhost:8000/subgraphs/name/ets/ets-local",
  stage: "https://api.studio.thegraph.com/query/71717/ets-testnet-stage/v0.0.2",
  production: "",
};

export default subgraphEndpoints;
