// SPDX-License-Identifier: MIT
pragma solidity >=0.8.3;

import "@openzeppelin/contracts/access/extensions/IAccessControlEnumerable.sol";

/**
 * @title Interface to LAOSMinterControlled
 */

interface ILAOSMinterControlled is IAccessControlEnumerable {
    /**
     * @dev Mints one single new asset. This is a simple proxy to the underlying precompiled collection
     * @param _to the recipients of the new asset
     * @param _slot the slot of the new asset
     * @param _tokenURI the tokenURI of the new asset
     * @return _tokenId the id of the new asset
     */
    function mintWithExternalURI (
        address _to,
        uint96 _slot,
        string calldata _tokenURI
    ) external returns (uint256 _tokenId);

    /**
     * @dev Evolves one existing asset to the newly provided tokenURIs
     * @param _tokenId the id of the existing assets to evolve
     * @param _tokenURI the new tokenURI of the provided asset
     */
    function evolveWithExternalURI(
        uint256 _tokenId,
        string calldata _tokenURI
    ) external;

    /**
     * @dev Mints a batch of new assets to the provided recipients, with the provided tokenURIs
     * @param _to an ordered array containing the recipients of each new asset
     * @param _slot an ordered array containing the slots of each new asset
     * @param _tokenURI an ordered array containing the tokenURI of each new asset
     * @return _tokenIds the ids of the new assets
     */
    function mintWithExternalURIBatch (
        address[] calldata _to,
        uint96[] calldata _slot,
        string[] calldata _tokenURI
    ) external returns (uint256[] memory _tokenIds);

    /**
     * @dev Evolves a batch of existing assets to the newly provided tokenURIs
     * @param _tokenId an ordered array containing the id each of the assets to evolve
     * @param _tokenURI an ordered array containing the new tokenURI of each provided asset
     */
    function evolveWithExternalURIBatch (
        uint256[] calldata _tokenId,
        string[] calldata _tokenURI
    ) external;

    /**
     * @dev Transfers the ownership of the underlying precompiled collection
     * @param _newOwner the new owner of the underlying precompiled collection
     */
    function transferPrecompileCollectionOwnership(address _newOwner) external;

    /**
     * @dev Returns the tokenURI of the provided tokenId as provided by the
     *  underlying precompiled collection
     * @return _tokenURI the corresponding tokenURI
     */
    function tokenURI(uint256 _tokenId) external view returns (string memory _tokenURI);
}