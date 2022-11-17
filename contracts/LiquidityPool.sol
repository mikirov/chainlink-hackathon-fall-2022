// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./StakingRewards.sol";

contract LiquidityPool is AccessControl, StakingRewards {
    using SafeERC20 for IERC20;

    uint256 public constant PERCENT_DECIMALS = 100; // 0 decimals (1-100%)
    uint256 public constant PROTOCOL_PERCENT_FEE = 1; // % fee per each token bridge

    /// @notice mapping that holds the total liquidity added by an account
    /// account => token => amount
    mapping(address => mapping(address => uint)) public liquidityOfProvider;
    /// @notice mapping that tracks the earned rewards of a liquidity provider

    /// @notice mapping that holds the total amount of tokens, the user has bridged but still not withdrawn
    /// account => token => amount
    mapping(address => mapping(address => uint)) public bridgedTokensOfUser;

    /// @notice the address of the bridge
    address public bridge;

    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    error InsufficientLiquidity(uint amount);
    error NothingToWithdraw();

    constructor(address owner) {
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
    }

    function setBridge(address _bridge) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bridge = _bridge;
        _grantRole(BRIDGE_ROLE, _bridge);
    }

    /// @notice function that returns the total liquidity for a given token
    function getLiquidityOfToken(address token) public view returns (uint) {
        return IERC20(token).balanceOf(address(this));
    }

    /// @notice function that returns the total token liquidity, provided by a given user
    function getLiquidityOfUser(address user, address token)
        public
        view
        returns (uint)
    {
        return liquidityOfProvider[user][token];
    }

    function getMaxWithdrawableAmount(address token, uint amount)
        public
        view
        returns (uint)
    {
        uint liquidity = getLiquidityOfToken(token);
        return liquidity <= amount ? liquidity : amount;
    }

    /// @notice function that increases liquidity for a given token
    function addLiquidity(address token, uint amount) external {
        liquidityOfProvider[msg.sender][token] += amount;
        _stake(token, amount);

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }

    /// @notice function that decreases liquidity for a liquidity provider
    function removeLiquidity(address token, uint amount) external {
        if (
            getLiquidityOfToken(token) < amount ||
            getLiquidityOfUser(msg.sender, token) < amount
        ) {
            revert InsufficientLiquidity(amount);
        }

        liquidityOfProvider[msg.sender][token] -= amount;
        _unstake(token, amount);

        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /// @notice function that claims all earned rewards for a user
    function claimRewards(address token) external {
        (, uint rewards) = calculateRewardsOf(token, msg.sender);

        rewards = getMaxWithdrawableAmount(token, rewards);

        if (rewards <= 0) {
            revert NothingToWithdraw();
        }
        if (getLiquidityOfToken(token) <= 0) {
            revert InsufficientLiquidity(rewards);
        }

        _claimRewards(token, rewards);

        IERC20(token).safeTransfer(msg.sender, rewards);
    }

    /// @notice function that increases bridged token amount for a given user
    function addBridgedToken(
        address user,
        address token,
        uint amount
    ) external onlyRole(BRIDGE_ROLE) {
        uint256 rewardAmount = (amount * PROTOCOL_PERCENT_FEE) /
            PERCENT_DECIMALS;

        _addReward(token, rewardAmount);
        bridgedTokensOfUser[user][token] += amount - rewardAmount;
    }

    /// @notice function that withdraws all available bridged token amount for a given user
    function withdrawBridgedToken(address user, address token)
        external
        onlyRole(BRIDGE_ROLE)
        returns (uint amount)
    {
        uint withdrawableAmount = getMaxWithdrawableAmount(
            token,
            bridgedTokensOfUser[user][token]
        );

        if (withdrawableAmount > 0) {
            bridgedTokensOfUser[user][token] -= withdrawableAmount;

            IERC20(token).safeTransfer(user, withdrawableAmount);
        }

        return withdrawableAmount;
    }
}
