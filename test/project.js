const { expect } = require('chai');
const { utils } = require('ethers');
const { ethers } = require('hardhat');



describe("Project", async() => {

    it("should register a project successfully", async() => {
        const [deployer, randomProjectAddress, randomAddress] = await ethers.getSigners();

        const projectContract = await ethers.getContractFactory("Project");
        const fundsContract = await ethers.getContractFactory("Funds");
        const funds = await fundsContract.deploy();
        const project = await projectContract.deploy(funds.address);
        await funds.setProjectContractAddress(project.address);
        await project.addProject("Unit Testing", "Running test cases", randomProjectAddress.address, utils.parseEther('15.0'));

        const numberOfProjects = await project.getTotalNumberofProjects();
        expect(numberOfProjects.toNumber()).to.equal(1);

        // const projectInfo = await project.getProject(randomAddress.address);
        // expect(await project.getProject(randomAddress.address)).to.throw("call revert excepti  on"); 
    })

    it("should return a registered project", async() => {
        const [deployer, randomProjectAddress, randomAddress] = await ethers.getSigners();

        const projectContract = await ethers.getContractFactory("Project");
        const fundsContract = await ethers.getContractFactory("Funds");
        const funds = await fundsContract.deploy();
        const project = await projectContract.deploy(funds.address);
        await funds.setProjectContractAddress(project.address);

        await project.addProject("Unit Testing", "Running test cases", randomProjectAddress.address, utils.parseEther('15.0'));

        const projectInfo = await project.getProject(randomProjectAddress.address);
        expect(projectInfo.name).to.equal("Unit Test");
    })


}) 