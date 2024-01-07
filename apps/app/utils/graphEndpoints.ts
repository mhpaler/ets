const graphEndpoints: Record<string, string> = {
  development: "http://localhost:8000/subgraphs/name/ets/ets-local",
  stage: "https://api.thegraph.com/subgraphs/name/ethereum-tag-service/ets-mumbai-stage",
  production: "https://api.thegraph.com/subgraphs/name/ethereum-tag-service/ets-mumbai",
};

export default graphEndpoints;
