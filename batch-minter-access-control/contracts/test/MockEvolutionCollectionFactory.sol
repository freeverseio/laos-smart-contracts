// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "../EvolutionCollectionFactory.sol";

contract MockEvolutionCollectionFactory is EvolutionCollectionFactory {

    function createCollection(address _owner) external returns (address) {
        return address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);
    }
}
