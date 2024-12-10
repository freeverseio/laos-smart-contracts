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
      chainId: 1337, // Hardhat Network's chain ID
    },

    laos: {
      url: 'https://rpc.laos.laosfoundation.io', // URL of your custom network
      chainId: 6283, // The Chain ID of your custom network
      gas: 'auto', // Gas settings
      gasPrice: 'auto', // Gas price settings
      accounts: [`0x${privateKey}`],
    },

    laosTestnet: {
      url: 'https://rpc.laossigma.laosfoundation.io', // URL of your custom network
      chainId: 62850, // The Chain ID of your custom network
      gas: 'auto', // Gas settings
      gasPrice: 'auto', // Gas price settings
      accounts: [`0x${privateKey}`],
    },

    venus: {
      url: 'https://rpc.laosvenus.gorengine.com', // URL of your custom network
      chainId: 6680, // The Chain ID of your custom network
      gas: 'auto', // Gas settings
      gasPrice: 'auto', // Gas price settings
      accounts: [`0x${privateKey}`],
    },
    
    zombienet: {
      url: 'http://127.0.0.1:9999/', // URL of your custom network
      chainId: 667, // The Chain ID of your custom network
      gas: 5000000, // Gas settings
      gasPrice: 15000000, // Gas price settings
      accounts: [`0x${privateKey}`],
    },
  },
};
