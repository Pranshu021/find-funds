require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config()
const {PRIVATE_KEY, ALCHEMY_API_KEY, OPTIMISM_GOERLI_URL, ALCHEMY_API_KEY_ETHEREUM, ETHEREUM_GOERLI_URL} = process.env;

const optimismGoerliUrl =
    process.env.ALCHEMY_API_KEY ?
    `https://opt-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}` :
    OPTIMISM_GOERLI_URL

const ethereumGoerliUrl = 
    process.env.ALCHEMY_API_KEY_ETHEREUM ?
    `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY_ETHEREUM}` : 
    ETHEREUM_GOERLI_URL


require("@nomiclabs/hardhat-waffle");
module.exports = {
  networks: {
    "ganache": {
      url:"http://127.0.0.1:7545",
    },
    "optimism-goerli": {
      url: optimismGoerliUrl,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    "ethereum-goerli": {
      url: ethereumGoerliUrl,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  solidity: "0.8.17",
};
