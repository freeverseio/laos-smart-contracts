// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.3;

import "./CreateCollection.sol";

/// @title Pallet Laos Evolution Interface
/// @author LAOS Team
/// @notice This interface allows Solidity contracts to interact with pallet-laos-evolution
/// @custom:address 0x0000000000000000000000000000000000000403
contract CreateCollectionProxy is EvolutionCollectionFactory {

    address constant precompileAddress = 0x0000000000000000000000000000000000000403;

    function createCollection(address _owner) external returns (address) {
        return EvolutionCollectionFactory(precompileAddress).createCollection(_owner);
    }
}