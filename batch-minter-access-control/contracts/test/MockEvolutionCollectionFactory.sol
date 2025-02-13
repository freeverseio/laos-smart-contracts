// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "../EvolutionCollection.sol";

contract MockEvolutionCollectionFactory {

    function createCollection(address owner) external returns (address) {
        return address(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);
    }
}
