//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * @notice DO NOT USE THIS CODE IN PRODUCTION. This is an example contract.
 */
contract ETSEnsure is ChainlinkClient {
  using Chainlink for Chainlink.Request;

  // variable bytes returned in a single oracle response
  bytes public data;
  string public ipfsHash;

  /**
   * @notice Initialize the link token and target oracle
   * @dev The oracle address must be an Operator contract for multiword response
   *
   *
   * Kovan Testnet details:
   * Link Token: 0xa36085F69e2889c224210F603D836748e7dC0088
   * Oracle: 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8 (Chainlink DevRel)
   *
   */
  constructor() {
    setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
    setChainlinkOracle(0x0bDDCD124709aCBf9BB3F824EbC61C87019888bb);
  }

  /**
   * @notice Request variable bytes from the oracle
   */
  function requestBytes() public {
    bytes32 specId = "2bb15c3f9cfc4336b95012872ff05092";
    uint256 payment = 100000000000000000;
    Chainlink.Request memory req = buildChainlinkRequest(specId, address(this), this.fulfillBytes.selector);
    req.add("get","https://ipfsapiets.herokuapp.com/api/v1/nft/0x8ee9a60cb5c0e7db414031856cb9e0f1f05988d1/3061/1");
    req.add("path", "IpfsHash");
    sendOperatorRequest(req, payment);
  }

  event RequestFulfilled( bytes32 indexed requestId, bytes indexed data);

  /**
   * @notice Fulfillment function for variable bytes
   * @dev This is called by the oracle. recordChainlinkFulfillment must be used.
   */
  function fulfillBytes(bytes32 requestId, bytes memory bytesData) public recordChainlinkFulfillment(requestId) {
    emit RequestFulfilled(requestId, bytesData);
    data = bytesData;
    ipfsHash = string(data);
  }
}
