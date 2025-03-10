// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IAirnodeRequestHelpers {
    function fulfill(bytes32 requestId, bytes calldata data) external;
}

contract MockAirnodeRrp {
    bytes32 public mockRequestId;
    mapping(bytes32 => bool) public requestMade;

    constructor(bytes32 _mockRequestId) {
        mockRequestId = _mockRequestId;
    }

    function makeFullRequest(
        address,
        bytes32,
        address,
        address,
        address,
        bytes4,
        bytes calldata
    ) external returns (bytes32) {
        // Track that this request was made
        requestMade[mockRequestId] = true;
        return mockRequestId;
    }

    // Helper function for tests to simulate Airnode fulfilling a request
    function fulfillRequest(
        address fulfillAddress,
        bytes4 fulfillFunctionId,
        bytes32 requestId,
        bytes calldata data
    ) external {
        // Only allow fulfillment of requests that were actually made
        require(requestMade[requestId], "Request not made");

        // Call the fulfillment function on the target contract
        (bool success, ) = fulfillAddress.call(abi.encodeWithSelector(fulfillFunctionId, requestId, data));
        require(success, "Fulfillment failed");

        // Clean up
        requestMade[requestId] = false;
    }
}
