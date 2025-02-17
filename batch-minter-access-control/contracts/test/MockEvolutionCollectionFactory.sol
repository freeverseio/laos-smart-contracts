// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "../EvolutionCollectionFactory.sol";

/**
 * @title MockEvolutionCollectionFactory
 * @dev A minimal mock of the precompiled code at the LAOS Network address:
 *   0x0000000000000000000000000000000000000403
 */

contract MockEvolutionCollectionFactory is EvolutionCollectionFactory {

    function createCollection(address _owner) external returns (address) {
        return address(0x0000000000000000000000000000000000000404);
    }
}
