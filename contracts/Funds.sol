//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

/// @title A decentralized Crowdfunding Platform
/// @author Sting
/// @dev Funds contract to hande fund transfers and manage balances, all the functions can only be called by Project contract.
contract Funds {
    
    address private immutable owner;

    /// @notice a projectContract variable is set to 0 at first
    /// @dev This variable will be set afterward by the owner via function. 
    address private projectContract = 0x0000000000000000000000000000000000000000;

    /// @dev balances mapping to keep track of donation balance of each project registered and contributed to
    mapping(address => uint256) private balances;

    /// @dev contriubution mapping of contributor address to project address to the amount.
    /// To keep track of contributions made by a user to a project.
    mapping(address => mapping(address => uint256)) private contribution;

    /// @dev _NOT_ENTERED, _ENTERED, and _status - variables used to check re-entrance in fund transfer calls. Booleans can also 
    /// be used but more likelihood to receive full refund. For more explanation of this :
    /// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/561d0eead30d3977847f2c2b4ae54eac31c218df/contracts/security/ReentrancyGuard.sol#L29
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;


    /// @dev modifier to check if the caller is Project contract or not.
    modifier onlyProjectContract {
        require(msg.sender == projectContract, "ACCESS DENIED");
        _;
    }

    /// @notice _status is set to _NOT_ENTERED initially
    constructor() payable {
        owner = msg.sender;
        _status = _NOT_ENTERED;
    }

    /**
    * @dev function setProjectPool - sets the project contract address, can only be called by the deployer
    * @notice projectContract address being passed after Project contract is deployed and initial 0 value is removed.
    */
    function setProjectContractAddress(address _projectContractAddress) external {
        require(msg.sender == owner, "ACCESS DENIED");
        projectContract = _projectContractAddress;
    }

    /**
    * @dev funciton contribute - accepts the investment money from the contributor and locks it. Request coming
    * from Project contract
    * @param _contributorAddress - address of the contributor/investor. Mostly msg.sender.
    * @param _projectAddress - address of the project to contribute to.
    * @dev Updates the balances, and contribution mapping.
    */
    function contribute(address _contributorAddress, address _projectAddress) external payable onlyProjectContract {
        balances[_projectAddress] += msg.value;
        contribution[_contributorAddress][_projectAddress] += msg.value;
    }

    /**
    * @dev function refund - To send the full contribution from a contributor/investor for a project.
    * @notice _status value changes to _ENTERED as soon as refund is called, if someone tries to re-enter the _status != _ENTERED
    * check fails and avoids any re-entrancy. If the transaction was normal and non-malicious, it proceeds and sets _status to
    * _NOT_ENTERED again.
    * @param _contributorAddress - address of contributor to give refund to - msg.sender
    * @param _projectAddress - address of project to get refund from.
    * @dev resets contribution mapping of contributor to 0, balance for project is reduced by the amount refunded.
    */
    function refund(address _contributorAddress, address _projectAddress) external onlyProjectContract {
        require(_status != _ENTERED, "Re-enterant call. YOU FRAUD !!");
        _status = _ENTERED;
        bool _sent = payable(_contributorAddress).send(contribution[_contributorAddress][_projectAddress]);
        require(_sent, "Transaction failed");
        contribution[_contributorAddress][_projectAddress] = 0;
        balances[_projectAddress] -= contribution[_contributorAddress][_projectAddress];
        _status = _NOT_ENTERED;
    }

    /** 
    * @dev function release - To release the funds collected from all the crowdfunding.
    * @param _owner - Owner of the project, amount sent to the owner.
    * @param _target - target of the project, used to validate if target is completed or not
    * @param _releaseTime - Release time of project, used in validation.
    * @param _votes - Number of votes to release funds at the time.
    
    * @dev Strict validations done before releasing funds - now time should be > releaseTime (90 days after registering)
    * balance of project > set target, atleast 51% yes/true votes required to release the funds.
    * balance mapping reset.
    */
    function release(
        address _projectAddress, 
        address _owner, 
        uint256 _target, 
        uint256 _releaseTime,
        uint256 _votes,
        uint256 _numberOfInvestors) external onlyProjectContract 
        {
        require(block.timestamp >= _releaseTime, "Unable to release funds. Lock-in period not over");
        require(balances[_projectAddress] >= _target, "Target not reached yet");
        require(_votes > (_numberOfInvestors / 2), "Not enough votes");
        bool _sent = payable(_owner).send(balances[_projectAddress]);
        require(_sent, "Transaction failed");
        balances[_projectAddress] = 0;
        }


    /// @dev Returns amount of contribution made by a user to project.
    function getContributionInfo(address _contributorAddress, address _projectAddress) external view onlyProjectContract returns (uint256) {
        return contribution[_contributorAddress][_projectAddress];
    }

    function hasContributed(address _contributorAddress, address _projectAddress) external view onlyProjectContract returns (bool) {
        if(contribution[_contributorAddress][_projectAddress] > 0) {
            return true;
        } else {
            return false;
        }
    }

    /// @dev returns current balance of any project or amount of funds raised for any project
    function getBalance(address _projectAddress) external view onlyProjectContract returns (uint256) {
        return balances[_projectAddress];
    }

    /// falback function
    receive() external payable {}
 

}