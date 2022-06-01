// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ETSAccessControls} from "../../ETSAccessControls.sol";
import {ETSLifeCycleControls} from "../../ETSLifeCycleControls.sol";
import {ETS} from "../../ETS.sol";

contract ETSAccessControlsUpgrade is ETSAccessControls {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}

contract ETSLifeCycleControlsUpgrade is ETSLifeCycleControls {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}

contract ETSUpgrade is ETS {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}
