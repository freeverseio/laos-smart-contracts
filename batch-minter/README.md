# A contract to do batch minting and evolution interacting with LAOS precompiles

Note that all methods remain in sole control of the owner of the batchMinter contract.
This repository is experimental, use at your own risk.

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

The contract in `contracts/LaosBatchMinter.sol` simply acts as a proxy for the precompiled contracts except
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