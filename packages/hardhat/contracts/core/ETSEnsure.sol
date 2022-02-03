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

    //address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    /**
    * @notice Initialize the link token and target oracle
    * @dev The oracle address must be an Operator contract for multiword response
    */
    constructor(address _oracle, bytes32 _jobId, uint256 _fee, address _link) public {
        if (_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }
        setChainlinkOracle(_oracle);

        //oracle = _oracle;
        jobId = _jobId;
        fee = _fee;
    }

  /**
   * @notice Request variable bytes from the oracle
   */
  function requestBytes() public {
    //bytes32 specId = "5a9a8d60eb894077b1e7a5b77dbfbca9";
    //uint256 payment = 100000000000000000;
    Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfillBytes.selector);
    req.add("get","https://ipfsapiets.herokuapp.com/api/v1/nft/0x8ee9a60cb5c0e7db414031856cb9e0f1f05988d1/3061/1");
    req.add("path", "IpfsHash");
    sendOperatorRequest(req, fee);
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
