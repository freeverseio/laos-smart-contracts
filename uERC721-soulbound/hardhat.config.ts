import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import "@nomicfoundation/hardhat-verify";
import * as dotenv from 'dotenv';
dotenv.config();

const privateKey =
  process.env.PRIVATE_KEY !== undefined
    ? process.env.PRIVATE_KEY
    : '123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0';

const POLYGONSCAN_KEY = process.env.POLYGONSCAN_KEY;
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
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

    polygonTestnet: {
      url: 'https://polygon-amoy-bor-rpc.publicnode.com/', // URL of your custom network
      chainId: 80002, // The Chain ID of your custom network
      gas: 'auto', // Gas settings
      gasPrice: 'auto', // Gas price settings
      accounts: [`0x${privateKey}`],
    },

    polygonMainnet: {
      url: 'https://polygon-bor.publicnode.com', // URL of your custom network
      chainId: 137, // The Chain ID of your custom network
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

    ethMainnet: {
      url: 'https://eth.llamarpc.com/', // URL of your custom network
      chainId: 1, // The Chain ID of your custom network
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
  },

  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_KEY,
      eth: ETHERSCAN_KEY,
      mainnet: ETHERSCAN_KEY,
    },
  },
};

export default config;
