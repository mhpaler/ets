// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ETSAccessControls } from "../ETSAccessControls.sol";
import { ETSToken } from "../ETSToken.sol";
import { ETSAuctionHouse } from "../ETSAuctionHouse.sol";

contract ETSAccessControlsUpgrade is ETSAccessControls {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}

contract ETSTokenUpgrade is ETSToken {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}

contract ETSAuctionHouseUpgrade is ETSAuctionHouse {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}
