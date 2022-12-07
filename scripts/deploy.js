const hre = require("hardhat");

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

// Funds Contract Address :  0xcAA539B0B1A06CeA50B20A6ddCCE2A3dA9feB622
// Project Contract Address :  0x677E9747f211d75B55e3587268d93603dDE545c5