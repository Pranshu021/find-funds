const hre = require("hardhat");
// const Web3 = require("web3");
require('dotenv').config()
const {PRIVATE_KEY, ALCHEMY_API_KEY, OPTIMISM_GOERLI_URL, ALCHEMY_API_KEY_ETHEREUM, ETHEREUM_GOERLI_URL} = process.env;


const main = async() => {
    const Funds = await hre.ethers.getContractFactory("Funds");
    const funds = await Funds.deploy()
    console.log("Funds Contract Address : ", funds.address);

    const Project = await hre.ethers.getContractFactory("Project")
    const project = await Project.deploy(funds.address);
    console.log("Project Contract Address : ", project.address);

    await funds.setProjectContractAddress(project.address);

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
})
/*
Ganache
 Funds Contract Address :  0x7c2bb6809C6A829De4cDc0348E46E56D7eC645f5
 Project Contract Address :  0x06Dc82dbaeE2f91875d9D705920fC6fccf788C28

Optimism Goerli
 Funds Contract Address :  0x916d5333B49B4f29F582DD96Abf335fe5b78e7D9
 Project Contract Address :  0x5008268804954B257c52eaeB607a39E7D99Dd22a

Ethereum Goerli
 Funds Contract Address :  0x916d5333B49B4f29F582DD96Abf335fe5b78e7D9
 Project Contract Address :  0x5008268804954B257c52eaeB607a39E7D99Dd22a
*/