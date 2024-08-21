# A contract to do public minting interacting with LAOS precompiles

The contract in `contracts/LaosPublicMinter.sol` simply acts as a proxy for the precompiled contracts except
for the write methods. It is to be used by:

1. Deploying to LAOS, setting the publicMinter owner to the desired EOA address (or multisig)
2. Setting the owner of a created collection precompile in LAOS to the deployed publicMinter
3. Enabling/Disabling publicMinting in the publicMinter contract

Note that evolution remains in sole control of the owner of the publicMinter contract.

There is a minimal version of the contract: `contracts/LaosPublicMinterMinimal.sol` which simply does not
have any enable/disable methods. Transferring the ownership of the precompile to this minimal contract
automaticall enables public minting. Disabling it can simply be done by then transferring the ownership
of the precompile to a different EOA addresss.

## Install, compile and test

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
$ ./node_modules/.bin/truffle exec scripts/public_minting_via_contract --network sigma
$ ./node_modules/.bin/truffle exec scripts/public_minting_via_contract_minimal --network sigma
```
