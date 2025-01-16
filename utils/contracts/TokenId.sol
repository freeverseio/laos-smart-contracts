// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract TokenId {
    function computeTokenId(address user, uint96 slot) public pure returns (uint256 tokenId) {
        return (uint256(slot) << 160) | uint256(uint160(user));
    }
}
