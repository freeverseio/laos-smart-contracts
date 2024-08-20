// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "./LaosEvolution.sol";
import "./Ownable.sol";

contract LaosPublicMinter is Ownable, EvolutionCollection {

    address public precompileAddress;

    mapping(address => bool) public whitelisted;

    constructor(address _ownerOfPublicMinter) Ownable(_ownerOfPublicMinter) {}

    function setPrecompileAddress(address _newAddress) public {
        precompileAddress = _newAddress;
    }

    function owner() public view returns (address){
        return EvolutionCollection(precompileAddress).owner();
    }

    function tokenURI(uint256 _tokenURI) external view returns (string memory) {
        return EvolutionCollection(precompileAddress).tokenURI(_tokenURI);
    }

    function mintWithExternalURI(
        address _to,
        uint96 _slot,
        string calldata _tokenURI
    ) external returns (uint256) {
        require(whitelisted[msg.sender], "Sender is not whitelisted");
        return EvolutionCollection(precompileAddress).mintWithExternalURI(_to, _slot, _tokenURI);
    }

    function evolveWithExternalURI(
        uint256 _tokenId,
        string calldata _tokenURI
    ) external {
         EvolutionCollection(precompileAddress).evolveWithExternalURI(_tokenId, _tokenURI);
    }

    function transferOwnership(address _newOwner) external {
        EvolutionCollection(precompileAddress).transferOwnership(_newOwner);
    }
}