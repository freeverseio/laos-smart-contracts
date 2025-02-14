// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import {AccessControlEnumerable} from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "./EvolutionCollectionFactory.sol";
import "./EvolutionCollection.sol";

/**
 * @title Simple contract to create a LAOS collection adding extra logic to
 *  grant minting role via OpenZeppelin's AccessControlEnumerable,
 *  and additionally allowing batch minting and evolving. 
 * @notice Developed by the LAOS Team and Freeverse
 */

contract LAOSMinterControlled is AccessControlEnumerable {
    bytes32 public constant METADATA_ADMIN_ROLE = keccak256("METADATA_ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    address public constant collectionFactoryAddress = 0x0000000000000000000000000000000000000403;
    address public precompileAddress;

    constructor(address _owner) {
        // Creates a collection using the precompile collection factory,
        // and atomically sets its owner to be this LAOSMinterControlled contract:
        precompileAddress = EvolutionCollectionFactory(collectionFactoryAddress).createCollection(address(this));

        // Grant all ownership roles of this newly deployed LAOSMinterControlled to the provided _owner
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(METADATA_ADMIN_ROLE, _owner);
        _grantRole(MINTER_ROLE, _owner);

        // Emit the same event from LAOSMinterControlled that the collection factory emits, to facilitate offchain listening
        emit EvolutionCollectionFactory.NewCollection(_owner, precompileAddress);
    }

    /**
     * @dev Mints a batch of new assets to the provided recipients, with the provided tokenURIs
     * @param _to an ordered array containing the recipients of each new asset
     * @param _slot an ordered array containing the slots of each new asset
     * @param _tokenURI an ordered array containing the tokenURI of each new asset
     */
    function mintWithExternalURIBatch (
        address[] calldata _to,
        uint96[] calldata _slot,
        string[] calldata _tokenURI
    ) external onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(_to.length == _slot.length && _slot.length == _tokenURI.length, "Array lengths must match");

        uint256[] memory mintedTokenIds = new uint256[](_to.length);

        for (uint256 i = 0; i < _to.length; i++) {
            mintedTokenIds[i] = EvolutionCollection(precompileAddress).mintWithExternalURI(_to[i], _slot[i], _tokenURI[i]);
        }
        return mintedTokenIds;
    }

    /**
     * @dev Mints one single new asset. This is a simple proxy to the underlying precompiled collection
     * @param _to the recipients of the new asset
     * @param _slot the slot of the new asset
     * @param _tokenURI the tokenURI of the new asset
     */
    function mintWithExternalURI (
        address _to,
        uint96 _slot,
        string calldata _tokenURI
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        return EvolutionCollection(precompileAddress).mintWithExternalURI(_to, _slot, _tokenURI);
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
     * @dev Transfers the ownership of the underlying precompiled collection contract
     * @param _newOwner the new owner of the underlying precompiled collection contract
     */
    function transferOwnership(address _newOwner) external onlyRole(METADATA_ADMIN_ROLE) {
        EvolutionCollection(precompileAddress).transferOwnership(_newOwner);
    }

    /**
     * @dev Returns the owner of the underlying precompiled collection contract
     */
    function owner() public view returns (address){
        return EvolutionCollection(precompileAddress).owner();
    }

    /**
     * @dev Returns the tokenURI of the provided tokenId as provided by the
     *  underlying precompiled collection contract
     */
    function tokenURI(uint256 _tokenId) external view returns (string memory) {
        return EvolutionCollection(precompileAddress).tokenURI(_tokenId);
    }
}