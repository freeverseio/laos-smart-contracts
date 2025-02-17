// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "../EvolutionCollection.sol";

/**
 * @title MockEvolutionCollection
 * @dev A minimal mock of the precompiled contract exposed when creating 
 * a LAOS collection via the collection factory.
 *
 * In tests, this mock is deployed and assigned to a fixed hardcoded 
 * address using `hardhat_setCode`, allowing interactions with it 
 * as if it were a real precompiled contract.
 *
 * However, since only the bytecode is replaced and not the contract’s state, 
 * any state variables (like ownership) do not persist across deployments. 
 * 
 * As a result, ownership can only be set once—during construction—
 * using the `immutable` keyword, which embeds its value directly 
 * into the bytecode at deployment time.
 */


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

    // Change of ownership not implemented in this mock becasue
    // state of this contract is irrelevant.
    // Only permissions are tested
    function transferOwnership(address _newOwner) external {}
}
