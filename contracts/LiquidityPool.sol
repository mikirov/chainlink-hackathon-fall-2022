// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract LiquidityPool is AccessControl {
    /// @notice mapping that holds the total liquidity added by an account
    /// account => token => amount
    mapping(address => mapping(address => uint)) public liquidityOfUser;

    /// @notice mapping that holds the total amount of tokens, the user has bridged but still not withdrawn
    /// account => token => amount
    mapping(address => mapping(address => uint)) public bridgedTokensOfUser;

    /// @notice mapping that holds the total liquidity of a given token on the other chain
    mapping(address => uint) => public remoteLiquidityOfToken;

    /// @notice mapping that holds the total liquidity of a given token on the current chain
    mapping(address => uint) => public thisLiquidityOfToken;

    address public bridge;

    uint256 public baseFeePercent = 1; // 1%

    mapping(address => mapping(address => uint256)) public userClaimedRewards;

    /// @notice token to total reward for that token
    mapping(address => uint256) public totalRewards;

    uint256 public liquidityLockUpPeriod = 7 days;

    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    error TransferFailed(address token, uint amount);
    error InsufficientLiquidity(uint amount);
    error NoRewardsToWithdraw();

    constructor(address owner) {
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
    }

    function setBaseFeePercentage(uint256 _baseFeePercent)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        baseFeePercent = _baseFeePercent;
    }

    function setBridge(address _bridge) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bridge = _bridge;
        _grantRole(BRIDGE_ROLE, _bridge);
    }

    function setLiquidityLockUpPeriod(uint256 period) external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        liquidityLockUpPeriod = period;
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
        return liquidityOfUser[user][token];
    }

    /// @notice function that increases liquidity for a given token
    function addLiquidity(address token, uint256 amount) external {
        bool status = IERC20(token).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (status == false) 
            revert TransferFailed(token, amount);

        liquidityOfUser[msg.sender][token].amount += amount;
        liquidityOfUser[msg.sender][token].lockUpEnd = block.timestamp + liquidityLockUpPeriod;
        
    }

    /// @dev TODO: rework this function
    /// @notice function that decreases liquidity for a given token
    function removeLiquidity(address token, uint amount) external {
        if (
            getLiquidityOfToken(token) < amount ||
            getLiquidityOfUser(msg.sender, token) < amount
        ) revert InsufficientLiquidity(amount);

        liquidityOfUser[msg.sender][token].amount -= amount;

        bool status = IERC20(token).transfer(msg.sender, amount);
        require(status);
    }

    function withdrawRewards(address token) external {
        uint256 userLiquidity = getLiquidityOfUser(msg.sender, token);
        if (userLiquidity == 0) revert InsufficientLiquidity(0);

        uint256 userShareOfRewards = getLiquidityOfToken(token) / userLiquidity;
        uint256 amountToWithdraw = ((totalRewards[token] * userShareOfRewards) /
            userShareOfRewards) - userClaimedRewards[msg.sender][token];
        if (amountToWithdraw <= 0) revert NoRewardsToWithdraw();

        totalRewards[token] -= amountToWithdraw;
        userClaimedRewards[msg.sender][token] += amountToWithdraw;

        bool status = IERC20(token).transfer(msg.sender, amountToWithdraw);
        require(status);
    }

    /// @notice function that returns total bridged token amount available to withdraw
    function getWithdrawableBridgedTokenAmount(address user, address token)
        public
        returns (uint)
    {
        uint withdrawableAmount = bridgedTokensOfUser[user][token];

        if (getLiquidityOfToken(token) < totalRewards) {
            withdrawableAmount = 0;
        }

        if (getLiquidityOfToken(token) < withdrawableAmount) {
            withdrawableAmount = getLiquidityOfToken(token);
        }

        return withdrawableAmount;
    }

    /// @notice function that increases bridged token amount for a given user
    function addBridgedToken(
        address user,
        address token,
        uint amount,
        uint256 totalRemoteLiquidity
    ) external onlyRole(BRIDGE_ROLE) {
        bridgedTokensOfUser[user][token] += amount;
        remoteLiquidityOfToken[token] = totalRemoteLiquidity;
    }

    /// @notice function that withdraws all available bridged token amount for a given user
    function withdrawBridgedToken(address user, address token)
        external
        onlyRole(BRIDGE_ROLE)
        returns (uint amount)
    {
        uint256 maxAvailableToWithdraw = getWithdrawableBridgedTokenAmount(
                user,
                token
            );

        if (maxAvailableToWithdraw <= 0)
            return 0;

        /// @dev here destination liquidity amount is guaranteed to be greater than 0
        uint256 thisLiquidityAmount = getLiquidityOfToken(token);
        uint256 remoteLiquidityAmount = remoteLiquidityOfToken[token];

        // fee per token bridge
        uint256 feePercent = baseFeePercent;
        // if remote chain has more liquidity than the current chain
        // stimulate the liquidity provders on the current chain with more fee %
        // if the difference is 4:1 - the fee would be 4*baseFeePercent = ~4%
        if (remoteLiquidityAmount > thisLiquidityAmount) {
            feePercent =
                remoteLiquidityAmount /
                thisLiquidityAmount * baseFeePercent;
            // 10% is the max cap of fee
            feePercent = feePercent >= 10 ? 10 : feePercent;
        }

        // calculates what is the bridge ratio vs all stakers
        uint256 bridgeLPRatio = thisLiquidityOfToken[token] / liquidityOfUser[address(this)];
        // total fee to take from the bridged amount
        uint256 totalFeeAmount = (maxAvailableToWithdraw * feePercent) / 100;

        // distribute the fee reward to the bridge and all stakers, based on the amount of liquidity provided by each
        uint256 bridgeReward = totalFeeAmount / bridgeLPRatio;
        uint256 stakersReward = totalFeeAmount - bridgeReward;

        totalRewards[token] += totalFeeAmount;
        bridgedTokensOfUser[user][token] -= maxAvailableToWithdraw;

        bool status = IERC20(token).transfer(
            user,
            maxAvailableToWithdraw - totalFeeAmount
        );
        require(status);
    }
}
