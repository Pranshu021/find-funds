/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle");
module.exports = {
  networks: {
    ganache: {
      url:"http://127.0.0.1:7545",
    }
  },
  solidity: "0.8.17",
};
