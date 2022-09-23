//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract Funds {
    
    address private immutable owner;
    address private projectPool = 0x0000000000000000000000000000000000000000;
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private contribution;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    modifier onlyProjectPool {
        require(msg.sender == projectPool, "ACCESS DENIED");
        _;
    }

    constructor() payable {
        owner = msg.sender;
        _status = _NOT_ENTERED;
    }

    function setProjectPoolAddress(address _projectPoolAddress) external {
        require(msg.sender == owner, "ACCESS DENIED");
        projectPool = _projectPoolAddress;
    }

    function contribute(address _contributorAddress, address _projectAddress) external payable onlyProjectPool {
        balances[_projectAddress] += msg.value;
        contribution[_contributorAddress][_projectAddress] += msg.value;
    }

    function refund(address _contributorAddress, address _projectAddress) external onlyProjectPool {
        require(_status != _ENTERED, "Re-enterant call. YOU FRAUD !!");
        bool _sent = payable(_contributorAddress).send(contribution[_contributorAddress][_projectAddress]);
        require(_sent, "Transaction failed");
        contribution[_contributorAddress][_projectAddress] = 0;
        balances[_projectAddress] -= contribution[_contributorAddress][_projectAddress];
        _status = _NOT_ENTERED;
    }

    function getContributionInfo(address _contributorAddress, address _projectAddress) external view onlyProjectPool returns (uint256) {
        return contribution[_contributorAddress][_projectAddress];
    }

    function getBalance(address _projectAddress) external view onlyProjectPool returns (uint256) {
        return balances[_projectAddress];
    }

    function release(
        address _projectAddress, 
        address _owner, 
        uint256 _target, 
        uint256 _releaseTime,
        uint256 _votes,
        uint256 _numberOfInvestors) external onlyProjectPool 
        {
        require(block.timestamp >= _releaseTime, "Unable to release funds. Lock-in period not over");
        require(balances[_projectAddress] >= _target, "Target not reached yet");
        require(_votes > (_numberOfInvestors / 2), "Not enough votes");
        bool _sent = payable(_owner).send(balances[_projectAddress]);
        require(_sent, "Transaction failed");
        balances[_projectAddress] = 0;
        }

    receive() external payable {}
 

}