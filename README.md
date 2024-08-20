# A contract to do public minting interacting with LAOS precompiles

1. install and compile:
```shell
npm ci
./node_modules/.bin/truffle compile
```

2. Create your `.env` file with the private key of account with enough balance (e.g. in zombienet, this is ALICE's key)

```shell
$ cat .env
DEPLOYER_MNEMONIC="62.......8692"
```

3. Execute script:
```shell
$ ./node_modules/.bin/truffle exec scripts/public_minting_via_contract --network sigma
```
