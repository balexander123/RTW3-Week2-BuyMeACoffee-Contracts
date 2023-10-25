const hre = require("hardhat");
const abi = require("../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json");
require("dotenv").config()

async function getBalance(provider, address) {
  const balanceBigInt = await provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

async function main() {
  // Get the contract that has been deployed to Goerli.
  const contractAddress="0xDBa03676a2fBb6711CB652beF5B7416A53c1421D";
  const contractABI = abi.abi;

  const networks = {
    goerli: process.env.GOERLI_URL,
    sepolia: process.env.SEPOLIA_URL
  };
  
  // Get network name from command line arguments
  let networkName = 'sepolia'; // default to 'sepolia' if HARDHAT_NETWORK is not provided

  if (!process.env.HARDHAT_NETWORK) {
    networkName = process.env.HARDHAT_NETWORK;
  };

  if (!networks[networkName]) {
    throw new Error(`Unsupported network: ${networkName}`);
  }
  
  const provider = new hre.ethers.providers.JsonRpcProvider(networks[networkName]);  // Ensure that signer is the SAME address as the original contract deployer,
  // or else this script will fail with an error.
  const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Instantiate connected contract.
  const buyMeACoffee = new hre.ethers.Contract(contractAddress, contractABI, signer);

  // Check starting balances.
  console.log("current balance of owner: ", await getBalance(provider, signer.address), "ETH");
  const contractBalance = await getBalance(provider, buyMeACoffee.address);
  console.log("current balance of contract: ", await getBalance(provider, buyMeACoffee.address), "ETH");

  // Withdraw funds if there are funds to withdraw.
  if (contractBalance !== "0.0") {
    console.log("withdrawing funds..")
    const withdrawTxn = await buyMeACoffee.withdrawTips();
    await withdrawTxn.wait();
  } else {
    console.log("no funds to withdraw!");
  }

  // Check ending balance.
  console.log("current balance of owner: ", await getBalance(provider, signer.address), "ETH");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
