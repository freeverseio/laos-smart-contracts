// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "./EvolutionCollection.sol";
import "./Ownable.sol";

contract LaosPublicMinterMinimal is Ownable, EvolutionCollection {

    address public precompileAddress;

    constructor(address _ownerOfPublicMinter) Ownable(_ownerOfPublicMinter) {}

    function setPrecompileAddress(address _newAddress) public onlyOwner {
        precompileAddress = _newAddress;
    }

    function mintWithExternalURI (
        address _to,
        uint96 _slot,
        string calldata _tokenURI
    ) external returns (uint256) {
        return EvolutionCollection(precompileAddress).mintWithExternalURI(_to, _slot, _tokenURI);
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