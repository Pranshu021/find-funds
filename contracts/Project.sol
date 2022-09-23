//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

interface IFunds {
    function contribute(address _contributorAddress, address _projectAddress) external payable;
    function getContributionInfo(address _contributorAddress, address _projectAddress) external view returns (uint256);
    function refund(address _contributorAddress, address _projectAddress) external;
    function release(address _projectAddress, address _owner, uint256 _target, uint256 _releaseTime, uint256 _votes, uint256 _numberOfInvestors) external;
}

contract Project {

    IFunds private immutable fundContract; 
    uint256 private projectIdCounter;
    uint256 private numberOfProjects;
    address private immutable owner;

    struct project {
        uint256 projectId;
        string name;
        string description;
        address projectAddress;
        uint256 releaseTime;
        uint256 target;
        address owner;
        uint256 totalInvestors;
        uint256 votes;
    }

    mapping(address => project) private projectInfo;
    mapping(address => mapping(address => bool)) private vote;

    project[] private projectList;

    event projectCreated(string _name, string _description, address _address, address _owner, uint256 _target);
    event projectRemoved(string _name, string _description, address _address, address _owner, uint256 _target);

    modifier projectExists(address _address) {
        require(projectInfo[_address].projectId != 0,  "No project exists with given address");
        _; 
    }

    modifier contributor(address _contributorAddress, address _projectAddress) {
        require(fundContract.getContributionInfo(_contributorAddress, _projectAddress) > 0, "You have not contributed to this project");
        _;
    }

    modifier onlyProjectOwner(address _projectAddress) {
        require(msg.sender == projectInfo[_projectAddress].owner, "Only Owner of the Project can call this");
        _;
    }

    constructor(address _fundContractAddress) {
        owner = msg.sender;
        fundContract = IFunds(_fundContractAddress);
    }

    function addProject(string memory _name, string memory _description, address _address, uint256 _target) public {
        require(projectInfo[_address].projectId == 0, "Address already being used by another Project");
        require(_address != address(0), "Invalid address");

        projectInfo[_address] = project(projectIdCounter+1, _name, _description, _address, (block.timestamp + 60 seconds), _target, msg.sender, 0, 0);
        projectList.push(projectInfo[_address]);
        projectIdCounter++;
        numberOfProjects++;

        emit projectCreated(projectInfo[_address].name, projectInfo[_address].description, _address, projectInfo[_address].owner, projectInfo[_address].target);
        
    }

    function removeProject(address _address) public projectExists(_address) onlyProjectOwner(_address) {
        projectList[(projectInfo[_address].projectId) - 1] = project(0, '', '', address(0), 0, 0, address(0), 0, 0);
        numberOfProjects--;
        emit projectRemoved(projectInfo[_address].name, projectInfo[_address].description, _address, projectInfo[_address].owner, projectInfo[_address].target);
        delete projectInfo[_address];
    }

    function contributeToProject(address _projectAddress) external payable projectExists(_projectAddress) {
        require(msg.value > 0, "Amount should be greater than 0");
        uint256 contribution = fundContract.getContributionInfo(msg.sender, _projectAddress);
        fundContract.contribute{value: msg.value}(msg.sender, _projectAddress);
        
        if(contribution == 0) {
            projectInfo[_projectAddress].totalInvestors += 1;
            projectInfo[_projectAddress].votes += 1;
            vote[msg.sender][_projectAddress] = true;
        }
    }

    function releaseFunds(address _projectAddress) external projectExists(_projectAddress) onlyProjectOwner(_projectAddress) {
        fundContract.release(_projectAddress, 
        projectInfo[_projectAddress].owner, 
        projectInfo[_projectAddress].target, 
        projectInfo[_projectAddress].releaseTime,
        projectInfo[_projectAddress].votes,
        projectInfo[_projectAddress].totalInvestors);

        removeProject(_projectAddress);
        
    }

    function toggleVote(address _projectAddress) external projectExists(_projectAddress) contributor(msg.sender, _projectAddress) {
        if(vote[msg.sender][_projectAddress]) {
            vote[msg.sender][_projectAddress] = false;
            projectInfo[_projectAddress].votes -= 1;
        } else {
            vote[msg.sender][_projectAddress] = true;
            projectInfo[_projectAddress].votes += 1;
        }
    }

    function refundContribution(address _projectAddress) external projectExists(_projectAddress) contributor(msg.sender, _projectAddress) {
        fundContract.refund(msg.sender, _projectAddress);
    }

    function getProject(address _address) external view projectExists(_address) returns (project memory) {
        return projectInfo[_address];
    }

    function getTotalNumberofProjects() external view returns (uint256) {
        return numberOfProjects;
    }

    function getOwnerofProject(address _address) external view projectExists(_address) returns (address)  {
        return projectInfo[_address].owner;
    }

    function getContribution(address _contributorAddress, address _projectAddress) external view projectExists(_projectAddress) contributor(_contributorAddress, _projectAddress) returns (uint256) {
        return fundContract.getContributionInfo(_contributorAddress, _projectAddress);
    }

    function getVotingInfo(address _contributor, address _projectAddress) external view projectExists(_projectAddress) contributor(_contributor, _projectAddress) returns (bool) {
        return vote[_contributor][_projectAddress];
    }

}

// Decrease the votes in toggleVote function