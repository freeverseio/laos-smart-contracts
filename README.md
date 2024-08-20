# A contract to do public minting interacting with LAOS precompiles

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
```
