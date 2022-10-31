// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract LiquidityPool is AccessControl {
    using SafeERC20 for IERC20;

    uint256 public constant PERCENT_DECIMALS = 100; // 0 decimals (1-100%)
    uint256 public constant PROTOCOL_PERCENT_FEE = 1; // % fee per each token bridge

    /// @notice mapping that holds the total liquidity added by an account
    /// account => token => amount
    mapping(address => mapping(address => uint)) public liquidityOfProvider;
    /// @notice mapping that tracks the earned rewards of a liquidity provider
    /// account => token => LiquidityProviderRewards
    mapping(address => mapping(address => LiquidityProviderRewards))
        public rewardsOfLiquidityProvider;

    /// @notice mapping that holds the total amount of tokens, the user has bridged but still not withdrawn
    /// account => token => amount
    mapping(address => mapping(address => uint)) public bridgedTokensOfUser;

    /// @notice mapping that holds a snapshot of the total liquidity per each new reward
    /// rewardId => Snapshot
    mapping(uint256 => Snapshot) public rewardSnapshots;

    /// @notice the address of the bridge
    address public bridge;

    /// @notice the total liquidity of all providers
    uint256 public totalLiquidity;
    /// @notice the length of all rewards
    uint256 public rewardSnapshotsLength;

    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    error InsufficientLiquidity(uint amount);

    struct Snapshot {
        uint256 totalLiquidity; // total liquidity at the time of the bridged tokens
        uint256 rewardAmount; // the amount of rewards to be distributed from the bridged token
    }

    struct LiquidityProviderRewards {
        uint256 lastRewardId; // the rewardId from where the liquidity of the user should start earn rewards
        uint256 rewards; // total rewards earned so far
    }

    /// @notice modifier that updates the earned rewards of a liquidity provider
    modifier updateLiquidityProviderRewards(address token) {
        (uint rewards, uint lastRewardId) = calculateRewards(msg.sender, token);

        LiquidityProviderRewards storage lp = rewardsOfLiquidityProvider[
            msg.sender
        ][token];

        lp.rewards = rewards;
        lp.lastRewardId = lastRewardId;

        _;
    }

    constructor(address owner) {
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
    }

    function setBridge(address _bridge) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bridge = _bridge;
        _grantRole(BRIDGE_ROLE, _bridge);
    }

    /// @notice function that calculates the total rewards the liquidity provider has earned so far
    function calculateRewards(address user, address token)
        public
        view
        returns (uint256 rewards, uint256 lastRewardId)
    {
        LiquidityProviderRewards memory lp = rewardsOfLiquidityProvider[user][
            token
        ];
        uint256 liquidityProviderAmount = liquidityOfProvider[user][token];

        rewards = lp.rewards;
        lastRewardId = lp.lastRewardId;

        if (liquidityProviderAmount <= 0) {
            return (rewards, lastRewardId);
        }

        for (
            uint256 rId = lp.lastRewardId;
            rId < rewardSnapshotsLength;
            rId++
        ) {
            // what % of the total liquidity the user owns
            uint256 share = (liquidityProviderAmount * PERCENT_DECIMALS) /
                rewardSnapshots[rId].totalLiquidity;
            // total reward amount the user should earn on his % share per each snapshot
            rewards +=
                (rewardSnapshots[rId].rewardAmount * share) /
                PERCENT_DECIMALS;
            lastRewardId = rId;
        }
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

    /// @notice function that returns total bridged token amount available to withdraw
    function getWithdrawableBridgedTokenAmount(address user, address token)
        public
        returns (uint)
    {
        uint withdrawableAmount = bridgedTokensOfUser[user][token];

        if (getLiquidityOfToken(token) < withdrawableAmount) {
            withdrawableAmount = getLiquidityOfToken(token);
        }

        return withdrawableAmount;
    }

    /// @notice function that returns total rewards of a token available to liquidity provider to withdraw
    function getWithdrawableRewardsAmount(address token) public returns (uint) {
        (uint withdrawableAmount, ) = calculateRewards(msg.sender, token);

        if (getLiquidityOfToken(token) < withdrawableAmount) {
            withdrawableAmount = getLiquidityOfToken(token);
        }

        return withdrawableAmount;
    }

    /// @notice function that increases liquidity for a given token
    function addLiquidity(address token, uint amount)
        external
        updateLiquidityProviderRewards(token)
    {
        totalLiquidity += amount;
        liquidityOfProvider[msg.sender][token] += amount;

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }

    /// @notice function that decreases liquidity for a liquidity provider
    function removeLiquidity(address token, uint amount)
        external
        updateLiquidityProviderRewards(token)
    {
        if (
            getLiquidityOfToken(token) < amount ||
            getLiquidityOfUser(msg.sender, token) < amount
        ) {
            revert InsufficientLiquidity(amount);
        }

        totalLiquidity -= amount;
        liquidityOfProvider[msg.sender][token] -= amount;

        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /// @notice function that claims all available rewards of the liquidity provider
    function claimRewards(address token)
        external
        updateLiquidityProviderRewards(token)
    {
        uint withdrawableRewards = getWithdrawableRewardsAmount(token);

        if (withdrawableRewards > 0) {
            rewardsOfLiquidityProvider[msg.sender][token]
                .rewards -= withdrawableRewards;

            IERC20(token).safeTransfer(msg.sender, withdrawableRewards);
        }
    }

    /// @notice function that increases bridged token amount for a given user
    function addBridgedToken(
        address user,
        address token,
        uint amount
    ) external onlyRole(BRIDGE_ROLE) {
        uint256 rewardAmount = (amount * PROTOCOL_PERCENT_FEE) /
            PERCENT_DECIMALS;

        bridgedTokensOfUser[user][token] += amount - rewardAmount;
        // makes a snapshot
        rewardSnapshots[rewardSnapshotsLength] = Snapshot(
            totalLiquidity,
            rewardAmount
        );
        rewardSnapshotsLength++;
    }

    /// @notice function that withdraws all available bridged token amount for a given user
    function withdrawBridgedToken(address user, address token)
        external
        onlyRole(BRIDGE_ROLE)
        returns (uint amount)
    {
        uint withdrawableTokenAmount = getWithdrawableBridgedTokenAmount(
            user,
            token
        );

        if (withdrawableTokenAmount > 0) {
            bridgedTokensOfUser[user][token] -= withdrawableTokenAmount;

            IERC20(token).safeTransfer(user, withdrawableTokenAmount);
        }

        return withdrawableTokenAmount;
    }
}
