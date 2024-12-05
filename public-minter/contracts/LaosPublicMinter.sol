// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "./EvolutionCollectionFactory.sol";
import "./EvolutionCollection.sol";
import "./Ownable.sol";

contract LaosPublicMinter is Ownable, EvolutionCollection {

    /**
     * @dev Emitted on deploy of a new PublicMinter contract
     * @param _owner the owner of the newly created PublicMinter
     * @param _precompileAddress the address of the newly created underlying precompiled collection address
     */
    event NewPublicMinter(address indexed _owner, address _precompileAddress);

    address public constant collectionFactoryAddress = 0x0000000000000000000000000000000000000403;
    address public precompileAddress;
    bool public isPublicMintingEnabled;

    modifier onlyOwnerOrPublicMinting() {
        require(isPublicMintingEnabled || publicMinterOwner() == msg.sender, "Not authorized");
        _;
    }

    constructor(address _ownerOfPublicMinter) Ownable(_ownerOfPublicMinter) {
        precompileAddress = EvolutionCollectionFactory(collectionFactoryAddress).createCollection(address(this));
        emit NewPublicMinter(_ownerOfPublicMinter, precompileAddress);
    }

    /**
     * @dev Sets a new owner for the underlying precompiled collection
     * @param _newAddress the ew owner for the underlying precompiled collection
     */
    function setPrecompileAddress(address _newAddress) public onlyOwner {
        precompileAddress = _newAddress;
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
    ) external onlyOwnerOrPublicMinting returns (uint256) {
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
     * @dev Enables any account to mint assets
     */
    function enablePublicMinting() external onlyOwner {
        isPublicMintingEnabled = true;
    }

    /**
     * @dev Sets mint permission only to owner of this contract
     */
    function disablePublicMinting() external onlyOwner {
        isPublicMintingEnabled = false;
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
    function tokenURI(uint256 _tokenURI) external view returns (string memory) {
        return EvolutionCollection(precompileAddress).tokenURI(_tokenURI);
    }
}