const hre = require("hardhat")
const Web3 = require("web3")

const gasCostEstimation = async() => {
    const web3 = new Web3(window.ethereum)
    const Funds = await hre.ethers.getContractFactory("Funds");
    const estimatedGas = await web3.estimateGas(Funds.getDeployTransaction().data)
    console.log(estimatedGas)
}

gasCostEstimation();