/**
 * Object containing the GraphQL endpoints for different environments. These endpoints are used
 * to interact with The Graph protocol to query blockchain data efficiently. Each environment
 * (development, stage, production) has a corresponding endpoint that points to a specific
 * subgraph deployed on The Graph. These subgraphs are tailored to different network configurations
 * and deployment stages, facilitating appropriate data retrieval for each scenario.
 *
 * The `development` endpoint is intended for local testing and development, typically pointing
 * to a local Graph node instance. This allows developers to test changes in a controlled
 * environment before deployment.
 *
 * The `stage` endpoint points to a staging subgraph hosted on The Graph's hosted service,
 * specifically for the Mumbai test network (Polygon/Matic testnet). This environment is used
 * for pre-production testing, enabling testing of new features or configurations in an environment
 * that closely mirrors production without affecting real users or data.
 *
 * The `production` endpoint is used for the production environment, pointing to a subgraph
 * that indexes data from the Ethereum mainnet or other production-level blockchains. This endpoint
 * is used in the live application where real users interact with the blockchain data through the subgraph.
 */
const graphEndpoints: Record<string, string> = {
  development: "http://localhost:8000/subgraphs/name/ets/ets-local",
  stage: "https://api.thegraph.com/subgraphs/name/ethereum-tag-service/ets-mumbai-stage",
  production: "https://api.thegraph.com/subgraphs/name/ethereum-tag-service/ets-mumbai",
};

export default graphEndpoints;
