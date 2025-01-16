// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title Minimal contract illustrating how tokenIds are generated from initOwner and slot
 */

contract TokenId {

    function computeTokenId(address initOwner, uint96 slot) public pure returns (uint256 tokenId) {
        return (uint256(slot) << 160) | uint256(uint160(initOwner));
    }

    function computeTokenIds(address[] calldata initOwners, uint96[] calldata slots) public pure returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](initOwners.length);

        for (uint256 i = 0; i < initOwners.length; i++) {
            tokenIds[i] = (uint256(slots[i]) << 160) | uint256(uint160(initOwners[i]));           
        }
        return tokenIds;
    }
}
