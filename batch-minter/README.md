# A contract to do batch minting and evolution interacting with LAOS precompiles

Note that all methods remains in sole control of the owner of the batchMinter contract.
This repository is experimental, use at your own risk.

## Contract

The contract in `contracts/LaosBatchMinter.sol` simply acts as a proxy for the precompiled contracts except
for the batch mint/evolve methods. It is to be used by:

1. Deploying `batchMinter` to LAOS, setting the batchMinter owner to the desired EOA address (or multisig)
2. Setting the owner of a created collection precompile in LAOS to the deployed batchMinter
3. Setting the batchMinter precompileAddress to point to the created collection precompile
4. Ready to batchMint or batchEvolve

## Numerology

First of all, the TX must be sent with a **maxGas = 13M**. Trying 14M already gives an error.

With this contraint, as the tests show, the maximum batch mint is approximately:

```
For assets with URI equal to IPFS addresses (47 letters long, such as `ipfs://QmQeN4qhzPpG6jVqJoXo2e86eHYPbFpKeUkJcTfrA5hJwz`):

...Batch Minting 700 assets with tokenURI of length 53
...num events produced =  700
Gas used for minting: 12434864
Gas used per mint: 17764.091428571428


...Batch Evolving 700 times, the asset with tokenId =  32...0364 with tokenURI of length 53
...num events produced =  700
Gas used for evolving: 12346908
Gas used per evolution: 17638.44
```

To get some other references, if all NFTs have URI length = 400, we have a gas per mint = 19186, which gives approx 650 mints.


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
$ ./node_modules/.bin/truffle exec scripts/test_batch_minting --network sigma
```
