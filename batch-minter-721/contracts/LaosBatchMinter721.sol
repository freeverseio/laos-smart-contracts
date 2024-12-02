// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "./EvolutionCollectionFactory.sol";
import "./EvolutionCollection.sol";
import "./Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title Simple contract enabling batch minting and evolution
 * @dev Includes all ERC721 code, but reverts on any type of transfer
 */

contract LaosBatchMinter721 is Ownable, EvolutionCollection, ERC721 {

    /**
     * @dev Indicates an error related to the fact that the token is non-transferrable (aka soulbound)
     * @param tokenId The id of the token
     */
    error ERC721TokenNonTrasferrable(uint256 tokenId);

    /**
     * @dev Emitted on deploy of a new BatchMinter contract
     * @param _owner the owner of the newly created BatchMinter
     * @param _precompileAddress the address of the newly created underlying precompiled collection address
     */
    event NewBatchMinter(address indexed _owner, address _precompileAddress);

    address public constant collectionFactoryAddress = 0x0000000000000000000000000000000000000403;
    address public precompileAddress;
    uint96 private counter;

    constructor(address _ownerOfPublicMinter) ERC721("name", "symbol") Ownable(_ownerOfPublicMinter) {
        precompileAddress = EvolutionCollectionFactory(collectionFactoryAddress).createCollection(address(this));
        emit NewBatchMinter(_ownerOfPublicMinter, precompileAddress);
    }

    /**
     * @dev Sets a new owner for the underlying precompiled collection
     * @param _newAddress the ew owner for the underlying precompiled collection
     */
    function setPrecompileAddress(address _newAddress) public onlyOwner {
        precompileAddress = _newAddress;
    }

    function mintTo (address _to, string memory _tokenURI) public onlyOwner returns (uint256 _tokenId) {
        counter++;
        return EvolutionCollection(precompileAddress).mintWithExternalURI(_to, counter, _tokenURI);
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
    ) external onlyOwner returns (uint256[] memory) {
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
    ) external onlyOwner returns (uint256) {
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
    ) external onlyOwner {
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
    ) external onlyOwner {
         EvolutionCollection(precompileAddress).evolveWithExternalURI(_tokenId, _tokenURI);
    }

    /**
     * @dev Transfers the ownership of the underlying precompiled collection contract
     * @param _newOwner the new owner of the underlying precompiled collection contract
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        EvolutionCollection(precompileAddress).transferOwnership(_newOwner);
    }

    /**
     * @dev Returns the owner of the underlying precompiled collection contract
     */
    function owner() public view returns (address){
        return EvolutionCollection(precompileAddress).owner();
    }

    /**
     * @dev Returns the tokenURI of the provided tokenId
     */
    function tokenURI(uint256 _tokenId) public view override(ERC721, EvolutionCollection) returns (string memory) {
        return EvolutionCollection(precompileAddress).tokenURI(_tokenId);
    }

    /**
     * @dev Makes any transfer revert
     */    
    function _update(address to, uint256 tokenId, address auth) internal view override returns (address) {
        revert ERC721TokenNonTrasferrable(tokenId);
    }
}