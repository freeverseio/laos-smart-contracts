# ERC721UniversalSoulbound Template Contract

This repository contains a Solidity ERC721 template contract that minimally extends the [uERC721 contract](https://github.com/freeverseio/laos-erc721) to allow for non-transfereability of tokens.
This repository is experimental, use at your own risk.

The two main contracts are:

* `ERC721UniversalSoulbound` - simply makes all tokens non-transferable (soulbound) forever
* `ERC721UniversalTradeLockable` - on deploy, all tokens are soulbound, but the owner retains the right to enable transfers at any later stage 

## Getting Started

### Prerequisites

Make sure you have all the required dependencies:

```bash
npm ci
```

### Compiling the Contract

Compile the contracts with the following command:

```bash
npx hardhat compile
```

### Testing the Contract

The following command runs the test suite:

```bash
npx hardhat test
```

### Deploying the Contract

To deploy the contract, edit the `hardhat.config.ts` file, and use the following command:

```bash
npx hardhat run --network <network-name> scripts/deploy.ts
```

### Verifying Contract

The following command can be used to verify the deployed contracts on [etherscan](https://etherscan.io/) or any other EVM scan (e.g [Polygonscan](https://polygonscan.com/)):

```bash
npx hardhat verify --network <network-name> <contract-address> <contract-deploy-arguments>
```
