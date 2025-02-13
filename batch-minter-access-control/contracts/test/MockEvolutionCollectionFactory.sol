// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "../EvolutionCollection.sol";

contract MockEvolutionCollectionFactory {

    function createCollection(address owner) external returns (address) {
        return address(42);
    }
}
