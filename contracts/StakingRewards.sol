// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

abstract contract StakingRewards {
    uint256 public constant DECIMALS = 1e18;

    /// @notice the amount of staked tokens per user
    /// token => user => staked amount
    mapping(address => mapping(address => uint256)) public stakedAmountOf;
    /// @notice the amount of ready-to-claim tokens earned per user
    /// token => user => earned rewards
    mapping(address => mapping(address => uint256)) public earnedRewardsOf;
    /// @notice snapshot of the reward rate(per staked token) at the time when the user changed his balance
    /// token => user => last snapshot of reward per token at the time when staked balance got updated
    mapping(address => mapping(address => uint256))
        public rewardPerTokenSnapshotOf;

    /// @notice the total amount of staked tokens
    mapping(address => uint256) public totalStakedAmount;
    /// @notice the total accumulated reward amount to be distributed
    mapping(address => uint256) public totalReward;
    /// @notice current reward rate to be paid per each token staked
    mapping(address => uint256) public rewardPerToken;

    constructor() {}

    /// @notice modifier that recalculates the reward per token and updates the earned rewards for the user
    modifier distributeRewards(address token) {
        (uint256 _rewardPerToken, uint256 _rewardsOfUser) = calculateRewardsOf(
            token,
            msg.sender
        );
        // reward per token could be zero only when total staked amount is also zero or there is no rewards to distribute
        if (_rewardPerToken > 0) {
            rewardPerToken[token] = _rewardPerToken;
            earnedRewardsOf[token][msg.sender] = _rewardsOfUser;
            rewardPerTokenSnapshotOf[token][msg.sender] = _rewardPerToken;
            totalReward[token] = 0;
        }
        _;
    }

    /// @notice function that calculates the total rewards earned by a given user
    function calculateRewardsOf(address token, address user)
        public
        view
        returns (uint256 _rewardPerToken, uint256 _rewardsOfUser)
    {
        if (totalStakedAmount[token] <= 0) {
            return (0, 0);
        }
        // latest reward per staked token
        _rewardPerToken =
            rewardPerToken[token] +
            totalReward[token] /
            totalStakedAmount[token];

        // reward rate for the period between now and last user balance update
        uint256 rewardRate = _rewardPerToken -
            rewardPerTokenSnapshotOf[token][user];

        _rewardsOfUser =
            (rewardRate * stakedAmountOf[token][user]) /
            DECIMALS +
            earnedRewardsOf[token][user];
    }

    /// @notice function that increases the reward amount
    function _addReward(address token, uint256 amount) internal {
        totalReward[token] += amount * DECIMALS;
    }

    function _stake(address token, uint256 amount)
        internal
        distributeRewards(token)
    {
        stakedAmountOf[token][msg.sender] += amount;
        totalStakedAmount[token] += amount;
    }

    function _unstake(address token, uint256 amount)
        internal
        distributeRewards(token)
    {
        require(
            stakedAmountOf[token][msg.sender] >= amount,
            "Staked amount too low"
        );
        require(totalStakedAmount[token] >= amount, "Staked amount too low");

        stakedAmountOf[token][msg.sender] -= amount;
        totalStakedAmount[token] -= amount;
    }

    function _claimRewards(address token, uint amount)
        internal
        distributeRewards(token)
    {
        require(
            earnedRewardsOf[token][msg.sender] >= amount,
            "Earned rewards too low"
        );

        earnedRewardsOf[token][msg.sender] -= amount;
    }
}
