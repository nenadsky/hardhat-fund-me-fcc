require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const GOERLI_RPC_URL =
    process.env.GOERLI_RPC_URL ||
    ""
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

module.exports = {
  //solidity: "0.8.17",
  solidity: {
    compilers: [
      { version: "0.8.17" },
      { version: "0.6.6" },
    ],
  },

  defaultNetwork: "hardhat", 
  networks: {
    hardhat: {
        chainId: 31337,
        // gasPrice: 130000000000,
    },
    goerli: {
        url: GOERLI_RPC_URL,
        accounts: [PRIVATE_KEY],
        chainId: 5,
        blockConfirmations: 6,
    },
  }, 
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    // customChains: [], // uncomment this line if you are getting a TypeError: customChains is not iterable

  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
},
  namedAccounts: {
    deployer: {
      default: 0,

    }
  }
};
