# Smart contract for managing a LAOS collection with controlled minting and evolution.


This contract adds access control to the main methods exposed by the precompiled collections on the LAOS Network.  
It closely follows the pattern used by [Sequence](https://github.com/0xsequence/contracts-library/blob/3f66a7dc0e06bc040b2deead8d472c516641fe84/src/tokens/ERC721/README.md#L4),  
which, in turn, inherits code from [OpenZeppelin's AccessControlEnumerable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/extensions/AccessControlEnumerable.sol) Solidity library.

In addition, the contract exposes convenient batch versions of the precompiled mint and evolve methods,  
allowing atomic minting and evolution of multiple assets in a single transaction.

In particular, these are the roles and callable methods:


| Method Name                          | Role             |
|--------------------------------------|-----------------|
| `mintWithExternalURI`               | `MINTER_ROLE`   |
| `evolveWithExternalURI`             | `MINTER_ROLE`   |
| `mintWithExternalURIBatch`          | `MINTER_ROLE`   |
| `evolveWithExternalURIBatch`        | `MINTER_ROLE`   |
| `transferPrecompileCollectionOwnership` | `MINT_ADMIN_ROLE` |

When deploying the [LAOSMinterControlled](contracts/LAOSMinterControlled.sol) contract, the constructor initializes everything required:

* It creates a LAOS collection using the precompiled factory and assigns its ownership to the newly deployed `LAOSMinterControlled` contract address.  
* It assigns the provided owner address the roles of `MINTER_ROLE`, `MINT_ADMIN_ROLE`, and `DEFAULT_ADMIN_ROLE`.  
* It emits the same `NewCollection` event as the precompiled factory to facilitate indexing and external monitoring.  


## Install

1. To install, compile and test:

```shell
npm ci
npx hardhat compile
npx hardhat test
```

## Deploy

1. Create your `.env` file with an account with enough balance to deploy:
```shell
$ cat .env
PRIVATE_KEY="abcd...1234"
```

2. Deploy:
```shell
$ npx hardhat run scripts/deploy.js --network laos
```