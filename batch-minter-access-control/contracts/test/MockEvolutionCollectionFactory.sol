// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "../EvolutionCollectionFactory.sol";

contract MockEvolutionCollectionFactory is EvolutionCollectionFactory {

    function createCollection(address _owner) external returns (address) {
        return address(0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0);
    }
}
