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
 Funds Contract Address :  0x81da4A50cde3FAF006342314b6514c63E4B6BA5a
 Project Contract Address :  0x04eA66B1a55067E94d750F26DcBc674eFDf9f51c

Optimism Goerli
 Funds Contract Address :  0x916d5333B49B4f29F582DD96Abf335fe5b78e7D9
 Project Contract Address :  0x5008268804954B257c52eaeB607a39E7D99Dd22a

Ethereum Goerli
 Funds Contract Address :  0x916d5333B49B4f29F582DD96Abf335fe5b78e7D9
 Project Contract Address :  0x5008268804954B257c52eaeB607a39E7D99Dd22a
*/