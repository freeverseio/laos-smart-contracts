// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ERC721Universal.sol";

/**
 * @title Contract for Universal Minting and Evolution of ERC721 tokens
 * @author Freeverse.io, www.freeverse.io
 * @dev This contract is an extension of the OpenZeppelin ERC721 implementation.
 *  On deploy, this contract allocates 2^96 slots to every possible 160b address,
 *  which are then filled and evolved in the Mint/Evolution consensus system.
 *  The null address is the only address that cannot own any slot; as usual,
 *  it is used as the target address of the transfer executed within the burn method.
 */
contract ERC721UniversalSoulbound is ERC721Universal {

    /**
     * @dev Indicates an error related to the fact that the token is non-transferrable (aka soulbound)
     * @param tokenId The id of the token
     */
    error ERC721TokenNonTrasferrable(uint256 tokenId);

    // controls if the tokens are soulbound (non-transferrable)
    bool public areTransfersEnabled;

    constructor(
        address owner_,
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721Universal(owner_, name_, symbol_, baseURI_) {}

    // Enables the transfer of tokens in this contract
    function enableTransfers() external onlyOwner {
        areTransfersEnabled = true;
    }

    // Disables the transfer of tokens in this contract
    function disableTransfers() external onlyOwner {
        areTransfersEnabled = false;
    }

    /// Prevents any transfer unless areTransfersEnabled = true.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        if (areTransfersEnabled) {
            return super._update(to, tokenId, auth);
        } else {
            revert ERC721TokenNonTrasferrable(tokenId);
        }
    }
}
