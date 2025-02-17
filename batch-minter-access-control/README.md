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



## Install and deploy

1. install and compile:
```shell
npm ci
npx hardhat compile
```

2. Create your `.env` file with an account with enough balance to deploy:
```shell
$ cat .env
PRIVATE_KEY="62.......8692"
```
3. Deploy:
```shell
$ npx hardhat run scripts/deploy.js --network laos
```

## Run end-to-end tests

1. Add a second account to your `.env` file;
```shell
$ cat .env
PRIVATE_KEY="62.......8692"
SECOND_PRIVATE_KEY="11.......1234"
```
2. Run end-to-end tests:
```shell
$ npx hardhat run scripts/test-e2e.js --network laos
```

## Contract

The contract in `contracts/LAOSMinterControlled.sol` simply acts as a proxy for the precompiled contracts except
for the batch mint/evolve methods. On deploy, the constructor creates a new collection, using the LAOS precompiled contract.
The `batchMinter` contract manages batch-logic, and it uses the precompile internally when executing mints or evolutions. 

## Numerology

With this constraint, as the tests show, the maximum batch mint is approximately:

```
For assets with URI equal to IPFS addresses (47 characters long, such as `ipfs://QmQeN4qhzPpG6jVqJoXo2e86eHYPbFpKeUkJcTfrA5hJwz`):

...Batch Minting 700 assets with tokenURI of length 53
...num events produced =  700
Gas used for minting: 12428332
Gas used per mint: 17754.76

...Batch Evolving 700 times, the asset with tokenId =  32...0364 with tokenURI of length 53
...num events produced =  700
Gas used for evolving: 12338104
Gas used per evolution: 17625.86
```

Other references: if all NFTs have URI length = 400, we have a gas per mint = 19186, which gives approx 650 mints.