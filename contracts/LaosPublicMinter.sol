// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "./EvolutionCollection.sol";
import "./Ownable.sol";

contract LaosPublicMinter is Ownable, EvolutionCollection {

    address public precompileAddress;
    bool public isPublicMintingEnabled;

    modifier onlyOwnerOrPublicMinting() {
        require(owner() == msg.sender || isPublicMintingEnabled, "Not authorized");
        _;
    }

    constructor(address _ownerOfPublicMinter) Ownable(_ownerOfPublicMinter) {}

    function setPrecompileAddress(address _newAddress) public onlyOwner {
        precompileAddress = _newAddress;
    }

    function mintWithExternalURI (
        address _to,
        uint96 _slot,
        string calldata _tokenURI
    ) external onlyOwnerOrPublicMinting returns (uint256) {
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

    function enablePublicMinting() external onlyOwner {
        isPublicMintingEnabled = true;
    }

    function disablePublicMinting() external onlyOwner {
        isPublicMintingEnabled = false;
    }

    function owner() public view returns (address){
        return EvolutionCollection(precompileAddress).owner();
    }

    function tokenURI(uint256 _tokenURI) external view returns (string memory) {
        return EvolutionCollection(precompileAddress).tokenURI(_tokenURI);
    }
}