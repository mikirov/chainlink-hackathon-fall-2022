// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../StakingRewards.sol";

contract StakingRewardsPublic is StakingRewards {
    function addReward(address token, uint amount) external {
        _addReward(token, amount);
    }

    function stake(address token, uint amount) external {
        _stake(token, amount);
    }

    function unstake(address token, uint amount) external {
        _unstake(token, amount);
    }
}
