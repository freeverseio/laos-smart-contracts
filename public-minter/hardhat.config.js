require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const privateKey =
  process.env.PRIVATE_KEY !== undefined
    ? process.env.PRIVATE_KEY
    : '123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0';

const POLYGONSCAN_KEY = process.env.POLYGONSCAN_KEY;
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },

    laos: {
      url: 'https://rpc.laos.laosfoundation.io',
      chainId: 6283,
      gas: 'auto',
      gasPrice: 'auto',
      accounts: [`0x${privateKey}`],
    },

    laosTestnet: {
      url: 'https://rpc.laossigma.laosfoundation.io',
      chainId: 62850,
      gas: 'auto',
      gasPrice: 'auto',
      accounts: [`0x${privateKey}`],
    },

    venus: {
      url: 'https://rpc.laosvenus.gorengine.com',
      chainId: 6680,
      gas: 'auto',
      gasPrice: 'auto',
      accounts: [`0x${privateKey}`],
    },

    zombienet: {
      url: 'http://127.0.0.1:9999/',
      chainId: 667,
      gas: 5000000,
      gasPrice: 15000000,
      accounts: [`0x${privateKey}`],
    },
  },
};
