// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { ETSAccessControls } from "../ETSAccessControls.sol";
import { ETSAuctionHouse } from "../ETSAuctionHouse.sol";
import { ETSEnrichTarget } from "../ETSEnrichTarget.sol";
import { ETSTarget } from "../ETSTarget.sol";
import { ETSToken } from "../ETSToken.sol";
import { ETS } from "../ETS.sol";
import { ETSRelayerFactory } from "../ETSRelayerFactory.sol";

contract ETSAccessControlsUpgrade is ETSAccessControls {
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

contract ETSEnrichTargetUpgrade is ETSEnrichTarget {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}

contract ETSTargetUpgrade is ETSTarget {
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

contract ETSUpgrade is ETS {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}

contract ETSRelayerFactoryUpgrade is ETSRelayerFactory {
    // Extend existing contract with new function.
    function upgradeTest() public pure returns (bool) {
        return true;
    }
}
