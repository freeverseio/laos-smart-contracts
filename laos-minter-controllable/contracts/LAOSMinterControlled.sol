// SPDX-License-Identifier: MIT
pragma solidity >=0.8.3;

import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "./ILAOSMinterControlled.sol";
import "./EvolutionCollectionFactory.sol";
import "./EvolutionCollection.sol";

/**
 * @title LAOSMinterControlled
 * @dev Smart contract for managing a LAOS collection with controlled minting and evolution.
 * Features:
 * - Role-based access control using OpenZeppelin's AccessControlEnumerable.
 * - Batch minting and evolving for efficient asset creation and modification.
 * @notice Developed by the LAOS Team and Freeverse.
 */


contract LAOSMinterControlled is ILAOSMinterControlled, AccessControlEnumerable {
    bytes32 public constant MINT_ADMIN_ROLE = keccak256("MINT_ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    address public constant collectionFactoryAddress = 0x0000000000000000000000000000000000000403;
    address public precompileAddress;

    constructor(address _owner) {
        // Creates a collection using the precompiled collection factory,
        // and assigns ownership to this LAOSMinterControlled contract:
        precompileAddress = EvolutionCollectionFactory(collectionFactoryAddress).createCollection(address(this));

        // Grant all roles of this newly deployed LAOSMinterControlled to the provided `_owner`
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(MINT_ADMIN_ROLE, _owner);
        _grantRole(MINTER_ROLE, _owner);

        // Mirrors the event emitted by the collection factory to facilitate indexing and external monitoring.
        emit EvolutionCollectionFactory.NewCollection(_owner, precompileAddress);
    }

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
    ) external onlyRole(MINTER_ROLE) returns (uint256 _tokenId) {
        return EvolutionCollection(precompileAddress).mintWithExternalURI(_to, _slot, _tokenURI);
    }

    /**
     * @dev Evolves one existing asset to the newly provided tokenURIs
     * @param _tokenId the id of the existing assets to evolve
     * @param _tokenURI the new tokenURI of the provided asset
     */
    function evolveWithExternalURI(
        uint256 _tokenId,
        string calldata _tokenURI
    ) external onlyRole(MINTER_ROLE) {
         EvolutionCollection(precompileAddress).evolveWithExternalURI(_tokenId, _tokenURI);
    }

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
    ) external onlyRole(MINTER_ROLE) returns (uint256[] memory _tokenIds) {
        require(_to.length == _slot.length && _slot.length == _tokenURI.length, "Array lengths must match");

        _tokenIds = new uint256[](_to.length);

        for (uint256 i = 0; i < _to.length; i++) {
            _tokenIds[i] = EvolutionCollection(precompileAddress).mintWithExternalURI(_to[i], _slot[i], _tokenURI[i]);
        }
        return _tokenIds;
    }

    /**
     * @dev Evolves a batch of existing assets to the newly provided tokenURIs
     * @param _tokenId an ordered array containing the id each of the assets to evolve
     * @param _tokenURI an ordered array containing the new tokenURI of each provided asset
     */
    function evolveWithExternalURIBatch (
        uint256[] calldata _tokenId,
        string[] calldata _tokenURI
    ) external onlyRole(MINTER_ROLE) {
        require(_tokenId.length == _tokenURI.length, "Array lengths must match");
        for (uint256 i = 0; i < _tokenId.length; i++) {
            EvolutionCollection(precompileAddress).evolveWithExternalURI(_tokenId[i], _tokenURI[i]);
        }
    }

    /**
     * @dev Transfers the ownership of the underlying precompiled collection
     * @param _newOwner the new owner of the underlying precompiled collection
     */
    function transferPrecompileCollectionOwnership(address _newOwner) external onlyRole(MINT_ADMIN_ROLE) {
        EvolutionCollection(precompileAddress).transferOwnership(_newOwner);
    }

    /**
     * @dev Returns the tokenURI of the provided tokenId as provided by the
     *  underlying precompiled collection
     * @return _tokenURI the corresponding tokenURI
     */
    function tokenURI(uint256 _tokenId) external view returns (string memory _tokenURI) {
        return EvolutionCollection(precompileAddress).tokenURI(_tokenId);
    }
}