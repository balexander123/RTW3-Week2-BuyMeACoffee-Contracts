require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config()

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const GOERLI_URL = process.env.GOERLI_URL;
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TEST1_PRIVATE_KEY = process.env.TEST1_PRIVATE_KEY;
const TEST2_PRIVATE_KEY = process.env.TEST2_PRIVATE_KEY;
const TEST3_PRIVATE_KEY = process.env.TEST3_PRIVATE_KEY;
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: GOERLI_URL,
      accounts: [PRIVATE_KEY]
    },
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY,
        TEST1_PRIVATE_KEY,
        TEST2_PRIVATE_KEY,
        TEST3_PRIVATE_KEY]
    }
  }
};
