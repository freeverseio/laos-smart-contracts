// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "./EvolutionCollection.sol";
import "./Ownable.sol";

contract LaosBatchMinter is Ownable, EvolutionCollection {

    address public precompileAddress;

    constructor(address _ownerOfPublicMinter) Ownable(_ownerOfPublicMinter) {}

    function setPrecompileAddress(address _newAddress) public onlyOwner {
        precompileAddress = _newAddress;
    }

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

    function mintWithExternalURI (
        address _to,
        uint96 _slot,
        string calldata _tokenURI
    ) external onlyOwner returns (uint256) {
        return EvolutionCollection(precompileAddress).mintWithExternalURI(_to, _slot, _tokenURI);
    }

    function evolveWithExternalURIBatch (
        uint256[] calldata _tokenId,
        string[] calldata _tokenURI
    ) external onlyOwner {
        require(_tokenId.length == _tokenURI.length, "Array lengths must match");
        for (uint256 i = 0; i < _tokenId.length; i++) {
            EvolutionCollection(precompileAddress).evolveWithExternalURI(_tokenId[i], _tokenURI[i]);
        }
    }

    function evolveWithExternalURI(
        uint256 _tokenId,
        string calldata _tokenURI
    ) external onlyOwner {
         EvolutionCollection(precompileAddress).evolveWithExternalURI(_tokenId, _tokenURI);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        EvolutionCollection(precompileAddress).transferOwnership(_newOwner);
    }

    function owner() public view returns (address){
        return EvolutionCollection(precompileAddress).owner();
    }

    function tokenURI(uint256 _tokenURI) external view returns (string memory) {
        return EvolutionCollection(precompileAddress).tokenURI(_tokenURI);
    }
}