// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC721Universal.sol";

/**
 * @title Extension of Universal Minting contract to allow for token non-transferrability mode
 * @author Freeverse.io, www.freeverse.io
 * @dev On deploy, this contract prevents any transfer (including burns) of tokens
 *   The owner retains the possibility to enable them
 *   For permanent non-transferrability, simply transfer the ownership to the null address.
 */
contract ERC721UniversalSoulbound is ERC721Universal {

    /**
     * @dev Indicates an error related to the fact that the token is non-transferrable (aka soulbound)
     * @param tokenId The id of the token
     */
    error ERC721TokenNonTrasferrable(uint256 tokenId);

    constructor(
        address owner_,
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721Universal(owner_, name_, symbol_, baseURI_) {}

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        revert ERC721TokenNonTrasferrable(tokenId);
    }
}
