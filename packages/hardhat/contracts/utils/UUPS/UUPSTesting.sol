// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {HashtagAccessControls} from "../../release/HashtagAccessControls.sol";
import {HashtagProtocol} from "../../release/HashtagProtocol.sol";
import {ERC721HashtagRegistry} from "../../release/ERC721HashtagRegistry.sol";

contract HashtagAccessControlsUpgrade is HashtagAccessControls {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}

contract HashtagProtocolUpgrade is HashtagProtocol {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}

contract ERC721HashtagRegistryUpgrade is ERC721HashtagRegistry {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}
