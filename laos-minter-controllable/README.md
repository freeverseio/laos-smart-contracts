# Smart contract for managing a LAOS collection with controlled minting and evolution.


The [LAOSMinterControlled](contracts/LAOSMinterControlled.sol) contract adds access control to the main methods exposed by the precompiled collections on the LAOS Network. It closely follows the pattern used by [Sequence](https://github.com/0xsequence/contracts-library/blob/3f66a7dc0e06bc040b2deead8d472c516641fe84/src/tokens/ERC721/README.md#L4), which, in turn, inherits code from [OpenZeppelin's AccessControlEnumerable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/extensions/AccessControlEnumerable.sol) Solidity library.

In addition, the contract exposes convenient batch versions of the precompiled mint and evolve methods, allowing atomic minting and evolution of multiple assets in a single transaction.

In particular, these are the roles and callable methods:


| Method Name                          | Role             |
|--------------------------------------|-----------------|
| `mintWithExternalURI`               | `MINTER_ROLE`   |
| `evolveWithExternalURI`             | `MINTER_ROLE`   |
| `mintWithExternalURIBatch`          | `MINTER_ROLE`   |
| `evolveWithExternalURIBatch`        | `MINTER_ROLE`   |
| `transferPrecompileCollectionOwnership` | `MINT_ADMIN_ROLE` |


## Deploy in detal
When deploying the [LAOSMinterControlled](contracts/LAOSMinterControlled.sol) contract, the constructor initializes everything required:
* It creates a LAOS precompiled collection using the precompiled factory and assigns its ownership to the newly deployed `LAOSMinterControlled` contract address.  
* It assigns the provided owner address the roles of `MINTER_ROLE`, `MINT_ADMIN_ROLE`, and `DEFAULT_ADMIN_ROLE`.  

Events deployed:
* LAOSMinterControlled emits `NewCollection(owner_all_rolles, precompileCollectionAddress)`, where `owner_all_rolles` is the address provided on deploy, which is assigned all roles.
* PrecompileCollectionFactory at `0x00...403` emits, as always, `NewCollection(LAOSMinterControlledAddress, precompileCollectionAddress)`, where `LAOSMinterControlledAddress` is the address of the newly deployed LAOSMinterControlled, since this is the owner of the LAOS precompiled collection`

Check this [Example of a deploy TX](https://explorer.laosnetwork.io/tx/0x296e8cf8d12468aa309d68276fd26ee23d9e8a445c17cf3e155e7a23529e7df3?tab=logs)


## Mints / Evolves in detail
When minting/evolving via `LAOSMinterControlled`, the following events are emitted:
* LAOS precompiled collection emits `MintedWithExternalURI(to, slot, tokenId, tokenURI)` as always
* LAOSMinterControlled also emits `MintedWithExternalURI(to, slot, tokenId, tokenURI)`, again, to facilitate indexing and external monitoring.

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

## Contract Verification

Flattening the contract is useful to verify its code in block explorers:
```shell
$ npx hardhat flatten contracts/LAOSMinterControlled.sol > flattened.sol
```