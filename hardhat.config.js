require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('@openzeppelin/hardhat-upgrades');

require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      forking: {
        url: process.env.RPC_URL,
      },
    },
    sepolia: {
      url: process.env.RPC_URL,
      accounts: [`0x${process.env.PRIVATEKEY}`]
    }
  },

  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  mocha: {
    timeout: 400000
  },

  etherscan: {
    apiKey: {
        sepolia: process.env.ETHERSCAN_API_KEY,
    }
  }
};
