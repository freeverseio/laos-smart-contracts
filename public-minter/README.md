# A contract to do public minting interacting with LAOS precompiles

Note that evolution remains in sole control of the owner of the publicMinter contract in both cases below.
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

The contract in `contracts/LaosPublicMinterMinimal.sol` simply acts as a proxy for the precompiled contracts except for the write methods. On deploy, the constructor creates a new collection, using the LAOS precompiled contract. The `PublicMinterMinimal` contract manages the logic to assign permissions to mint and evolve, and it uses the precompile internally when executing mints or evolutions. 

**To disable public minting on the precompile collection, simply transfer its ownership to a different EOA account, or to a different smart contract.**