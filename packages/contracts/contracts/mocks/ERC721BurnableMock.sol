// SPDX-License-Identifier: MIT

// Hello
pragma solidity ^0.8.10;

import { ERC721Burnable, ERC721 } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract ERC721BurnableMock is ERC721Burnable {
    // solhint-disable no-empty-blocks
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function safeMint(address to, uint256 tokenId, bytes memory _data) public {
        _safeMint(to, tokenId, _data);
    }
}
