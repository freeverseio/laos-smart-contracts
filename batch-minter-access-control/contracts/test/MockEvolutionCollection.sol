// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "../EvolutionCollection.sol";

contract MockEvolutionCollection is EvolutionCollection {
    address immutable public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function mintWithExternalURI(address _to, uint96 _slot, string calldata _tokenURI) external returns (uint256) {
        return uint256(keccak256(abi.encodePacked(_to, _slot, _tokenURI)));
    }

    function evolveWithExternalURI(uint256 _tokenId, string calldata _tokenURI) external {}

    function tokenURI(uint256 _tokenId) external view returns (string memory) {
        return "42";
    }

    function transferOwnership(address _newOwner) external {
        // owner = _newOwner;
    }
}
