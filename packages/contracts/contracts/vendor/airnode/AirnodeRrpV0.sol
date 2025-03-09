// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { AirnodeRrpV0 } from "@api3/airnode-protocol/contracts/rrp/AirnodeRrpV0.sol";

contract AirnodeRrpV0Proxy is AirnodeRrpV0 {
    /// @notice Empty constructor to satisfy linting rules
    constructor() AirnodeRrpV0() {}
}
