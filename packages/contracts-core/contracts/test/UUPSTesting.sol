// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ETSAccessControls} from "../ETSAccessControls.sol";
import {ETSToken} from "../ETSToken.sol";

contract ETSAccessControlsUpgrade is ETSAccessControls {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}

contract ETSUpgrade is ETSToken {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}
