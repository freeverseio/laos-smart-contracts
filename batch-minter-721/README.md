# Extension of batchMinter contract to be used with 721 interfaces

This is an extension of the BatchMinter contract that exposes 721 methods,
but blocks all transfers.

## Contract

The contract in `contracts/...` 

## Install, compile and test

The tests are "integration tests" that run directly on LAOS, because we wanted to avoid mocking the logic of the precompile.

1. install and compile:
```shell
npm ci
./node_modules/.bin/truffle compile
```

2. Create your `.env` file with the private keys of two accounts with enough balance

```shell
$ cat .env
DEPLOYER_MNEMONIC="62.......8692"
SECOND_ACCOUNT_MNEMONIC="3f.......11"
```

3. Execute script that tests it all:
```shell
$ ./node_modules/.bin/truffle exec scripts/... --network sigma
```
