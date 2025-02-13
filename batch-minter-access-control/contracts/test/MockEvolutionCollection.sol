// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract MockEvolutionCollection {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function mintWithExternalURI(address to, uint96 slot, string calldata tokenURI) external returns (uint256) {
        return 43;
    }

    function evolveWithExternalURI(uint256 tokenId, string calldata newTokenURI) external returns (uint256) {
        return 42;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        return "22";
    }

    function transferOwnership(address newOwner) external {
        owner = newOwner;
    }
}
