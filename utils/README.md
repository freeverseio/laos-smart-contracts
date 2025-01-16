# Minimal Example Illustrating TokenID Generation

A mimimal [smart contract](./contracts/TokenId.sol) is provided that illustates how tokenIds are generated from initOwner and slot,
by simply concatenating them.


```shell
npm ci
npx hardhat compile
npx hardhat test
```
