//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @title A decentralized Crowdfunding Platform
/// @author Sting
/// @dev Project.sol is the main contract, Funds contract can only be called by Project


/// @dev Interface for Funds contract
interface IFunds {
    function contribute(address _contributorAddress, address _projectAddress) external payable;
    function getContributionInfo(address _contributorAddress, address _projectAddress) external view returns (uint256);
    function refund(address _contributorAddress, address _projectAddress) external;
    function release(address _projectAddress, address _owner, uint256 _target, uint256 _releaseTime, uint256 _votes, uint256 _numberOfInvestors) external;
    function getBalance(address _projectAddress) external view returns (uint256);
    function hasContributed(address _contributorAddress, address _projectAddress) external view returns (bool);
}

contract Project {

    IFunds private immutable fundContract; 
    uint256 private projectIdCounter;
    uint256 private numberOfProjects;
    address private immutable owner;
    /**
    * @dev Structure of information about "project"
    * projectAddress is required in case if project has a different address than the user
    * release time is now + 90 days - time at which funds can be released
    * target is the target amount that project dezires to fund from the crowd
    */
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

    /// @dev mapping for an address to project
    mapping(address => project) private projectInfo;
    mapping(address => mapping(address => bool)) private vote;

    /// @dev list of projects being registered on the contract
    project[] private projectList;

    event projectCreated(string _name, string _description, address _projectAddress, uint256 _releaseTime, uint256 _target, address _owner, uint256 _totalInvestors, uint256 _votes);
    event projectRemoved(string _name, string _description, address _projectAddress, address _owner, uint256 _target);
    event contributionEvent(address _projectAddress, address _contributorAddress, uint256 _amount);
    event voteToggle(address _projectAddress, address _contributorAddress, bool _toggle);
    event refundContributionEvent(address _projectAddress, address _contrinutorAddress);
    event releaseFundsEvent(address _projectAddress, address _owner, uint256 _target, uint256 _releaseTime, uint256 _votes, uint256 _totalInvestors);
    
    /**  
    * @dev its modifier to check if the mentioned project with the address exists or not.
    * @param _address - address of the project
    */
    modifier projectExists(address _address) {
        require(projectInfo[_address].projectId != 0,  "No project exists with given address");
        _; 
    }

    /**
    * @dev modifier to confirm if the given user address (mostly msg.sender) is an investor to the project or not.
    * @param _contributorAddress - Address of the investor/contributor to be confirmed
    * @param _projectAddress - address of the project
    */
    modifier contributor(address _contributorAddress, address _projectAddress) {
        require(fundContract.getContributionInfo(_contributorAddress, _projectAddress) > 0, "You have not contributed to this project");
        _;
    }
    /// @dev activities like Releasing funds that can be only performed by the owner of the project
    /// @param _projectAddress - address of the project.
    modifier onlyProjectOwner(address _projectAddress) {
        require(msg.sender == projectInfo[_projectAddress].owner, "Only Owner of the Project can call this");
        _;
    }

    constructor(address _fundContractAddress) {
        owner = msg.sender;
        fundContract = IFunds(_fundContractAddress);
    }

    /**
    * @dev addProject function to create/add a project to start gathering funds.
    * @param _name - name of the project
    * @param _description - a small description about the project
    * @param _address - address of the project, can be msg.sender or any other address
    * @param _target - to specify a set amount to be achieved from this fund riser

    * @dev
    * Checks if any project already exists with the given address, and the address shouldn't be a 0 address, NO BURNING !!
    * Creates a project struct with a unique id (not random) but sequential, releaseTime is set to 90 days from now
    * Push the project to list of projects, increase the projectId counter and numberOfProject counter
    */
    function addProject(string memory _name, string memory _description, address _address, uint256 _target) public {
        require(projectInfo[_address].projectId == 0, "Address already being used by another Project");
        require(_address != address(0), "Invalid address");

        projectInfo[_address] = project(projectIdCounter+1, _name, _description, _address, (block.timestamp + 90 days), _target, msg.sender, 0, 0);
        projectList.push(projectInfo[_address]);
        projectIdCounter++;
        numberOfProjects++;

        emit projectCreated(projectInfo[_address].name, projectInfo[_address].description, _address, projectInfo[_address].releaseTime, projectInfo[_address].target, projectInfo[_address].owner, projectInfo[_address].totalInvestors, projectInfo[_address].votes);
        
    }

    /**
    * @dev removeProject Function to remove a project, this function can only be called by project Owner. Automatically called after Releasefunds.
    * If balance of project is > 0, the project cannot be removed as it still holds the funds that are invested by users
    * @param _address - Address of the project to be removed
    * @dev project is set to 0 in the list, using the sequential index being stored in parallel with id. Mapping is deleted.
    */
    function removeProject(address _address) public projectExists(_address) onlyProjectOwner(_address) {
        require(fundContract.getBalance(_address) == 0, "Project Can't be removed. Funds are invested by people.");
        projectList[(projectInfo[_address].projectId) - 1] = project(0, '', '', address(0), 0, 0, address(0), 0, 0);
        numberOfProjects--;
        emit projectRemoved(projectInfo[_address].name, projectInfo[_address].description, _address, projectInfo[_address].owner, projectInfo[_address].target);
        delete projectInfo[_address];
    }
    /**
    * @dev function contributeToProject - For any user to contribute to a project by mentioning the address.
    * @param _projectAddress - Address of the project to invest funds to
    * @dev Fetching the contribution from Funds contract to confirm if investing first time in the mentioned project. This is 
    * used in setting the intial vote
    * Initially, by default when anyone contributes/invest in any project, the vote to release the funds by owner is TRUE but
    * a button and warning is shown on front end to toggle it, this is done for the scenario where if majority of stakeholders are
    * unable to vote true (forgot keys to account, forgot to give vote, etc.) and the funds getting stuck in
    * the contract rendering them useless.

    * @dev since fund transfers and "banking" functions are handled by Funds contract, request along with msg.value is sent to
    * create an entry in the ledger as a contribution and increase the balance of mentioned project. 
    */
    function contributeToProject(address _projectAddress) public payable projectExists(_projectAddress) {
        require(msg.value > 0, "Amount should be greater than 0");
        uint256 contribution = fundContract.getContributionInfo(msg.sender, _projectAddress);
        fundContract.contribute{value: msg.value}(msg.sender, _projectAddress);
        
        if(contribution == 0) {
            projectInfo[_projectAddress].totalInvestors += 1;
            projectInfo[_projectAddress].votes += 1;
            vote[msg.sender][_projectAddress] = true;
        }

        emit contributionEvent(_projectAddress, msg.sender, msg.value);
    }


    /**
    * @dev function contributionInfo - Returns true if _contributorAddress has funded to _projectAddress, false if no Funding.
    * @dev require condition to check if zero address then contacts the fundContract's hasContributed function.
    */
    function contributionInfo(address _contributorAddress, address _projectAddress) public view projectExists(_projectAddress)returns (bool) {
        require(_contributorAddress != address(0), "Zero Address");
        return(fundContract.hasContributed(_contributorAddress, _projectAddress));
    }

    /**
    * @dev function releaseFunds - Function that can be only called by project owners, to release the collected funds from Funds
    * (The "Bank") contract to their or projects accounts, to further utilize them
    * @param _projectAddress - Address of the project to release funds from
    * @dev the required checks for voting and releaseTime are done by Funds contract. 
    * release function from fundsContract is called to do the required checks, send the amount to the owner/project if all checks
    * pass, update the ledger and balances.
    * Project is removed after funds are released, owner can again start with the same address or fresh address with new target if
    * more funds are required.
    */
    function releaseFunds(address _projectAddress) public projectExists(_projectAddress) onlyProjectOwner(_projectAddress) {
        fundContract.release(_projectAddress, 
        projectInfo[_projectAddress].owner, 
        projectInfo[_projectAddress].target, 
        projectInfo[_projectAddress].releaseTime,
        projectInfo[_projectAddress].votes,
        projectInfo[_projectAddress].totalInvestors);

        emit releaseFundsEvent(_projectAddress, projectInfo[_projectAddress].owner, projectInfo[_projectAddress].target, projectInfo[_projectAddress].releaseTime, projectInfo[_projectAddress].votes, projectInfo[_projectAddress].totalInvestors);

        removeProject(_projectAddress);
    }

    /**
    * @dev function toggleVote - To toggle the vote that controls condition of releasing funds, from default true to false or
    * false to true, based on previous value.
    * @param _projectAddress - Address of the project to vote in regards to
    */
    function toggleVote(address _projectAddress) public projectExists(_projectAddress) contributor(msg.sender, _projectAddress) {
        if(vote[msg.sender][_projectAddress]) {
            vote[msg.sender][_projectAddress] = false;
            projectInfo[_projectAddress].votes -= 1;
            emit voteToggle(_projectAddress, msg.sender, false);

        } else {
            vote[msg.sender][_projectAddress] = true;
            projectInfo[_projectAddress].votes += 1;
            emit voteToggle(_projectAddress, msg.sender, true);
        }
    }
    /**
    * @dev function refundContribution - to get a full refund of the contribution made.
    * @param _projectAddress - Address of the project to get a refund from
    * @dev calling refund function from Funds contract, a necessary check already done to validate if the user has contributed.
    */
    function refundContribution(address _projectAddress) public projectExists(_projectAddress) contributor(msg.sender, _projectAddress) {
        fundContract.refund(msg.sender, _projectAddress);
        projectInfo[_projectAddress].totalInvestors -= 1;
        if(vote[msg.sender][_projectAddress] == true) projectInfo[_projectAddress].votes -= 1;
        emit refundContributionEvent(_projectAddress, msg.sender);
    }

    /// @dev returns the struct of project from the address it's mapped to.
    /// @param _address - address of project to get info about.
    function getProject(address _address) external view projectExists(_address) returns (project memory) {
        return projectInfo[_address];
    }

    /// @dev returns total number of projects registered.
    function getTotalNumberofProjects() external view returns (uint256) {
        return numberOfProjects;
    }

    /// @dev returns the address of owner of project, can be project address itself.
    /// @param _address - address of project to get owner info about.
    function getOwnerofProject(address _address) external view projectExists(_address) returns (address)  {
        return projectInfo[_address].owner;
    }

    /** 
    * @dev returns the amount of investment made by a user to mentioned project.
    * Calls Fund contract get mapping function to retreive the ledger info.
    * @param _contributorAddress - Address of user who contributed, can be msg.sender
    * @param _projectAddress - address of project to validate investment made to. 
    */
    function getContribution(address _contributorAddress, address _projectAddress) public view projectExists(_projectAddress) contributor(_contributorAddress, _projectAddress) returns (uint256) {
        return fundContract.getContributionInfo(_contributorAddress, _projectAddress);
    }

    /** 
    * @dev returns the vote to release funds is true or false for a user to the mentioned project.
    * @param _contributor - address of user
    * @param _projectAddress - address of the project
    */
    function getVotingInfo(address _contributor, address _projectAddress) external view projectExists(_projectAddress) contributor(_contributor, _projectAddress) returns (bool) {
        return vote[_contributor][_projectAddress];
    }

    function getTotalAmountInvested(address _projectAddress) external view projectExists(_projectAddress) returns(uint256) {
        return fundContract.getBalance(_projectAddress);
    }

}