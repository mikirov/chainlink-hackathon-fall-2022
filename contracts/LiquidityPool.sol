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

    address public bridge;

    uint256 public baseFeePercent = 1; // 1%

    mapping(address => mapping(address => uint256)) public userClaimedRewards;

    /// @notice token to total reward for that token
    mapping(address => uint256) public totalRewards;

    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    error TransferFailed(address token, uint amount);
    error InsufficientLiquidity(uint amount);
    error NoRewardsToWithdraw();

    constructor(address owner) {
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
    }

    function setBaseFeePercentage(uint256 _baseFeePercent) external onlyRole(DEFAULT_ADMIN_ROLE) {
        baseFeePercent = _baseFeePercent;
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
        return liquidityOfUser[user][token];
    }

    modifier updateReward(address account, address token, uint256 amount) {
        _;


    }

    /// @notice function that increases liquidity for a given token
    function addLiquidity(address token, uint amount) updateReward(msg.sender, token, amount) external {
        bool status = IERC20(token).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (status == false) revert TransferFailed(token, amount);

        liquidityOfUser[msg.sender][token] += amount;
    }

    /// @dev TODO: rework this function
    /// @notice function that decreases liquidity for a given token
    function removeLiquidity(address token, uint amount) external {
        if (
            getLiquidityOfToken(token) < amount ||
            getLiquidityOfUser(msg.sender, token) < amount
        )
            revert InsufficientLiquidity(amount);

        liquidityOfUser[msg.sender][token] -= amount;

        IERC20(token).transfer(msg.sender, amount);
    }

    function withdrawRewards(address token) external {
        
        uint256 userLiquidity = getLiquidityOfUser(msg.sender, token);
        if(userLiquidity == 0) 
            revert InsufficientLiquidity(0);
        
        uint256 userShareOfRewards = getLiquidityOfToken(token) / userLiquidity;
        uint256 amountToWithdraw = (totalRewards[token] * userShareOfRewards / userShareOfRewards) - userClaimedRewards[msg.sender][token];
        if(amountToWithdraw <= 0) 
            revert NoRewardsToWithdraw();

        totalRewards[token] -= amountToWithdraw;
        userClaimedRewards[msg.sender][token] += amountToWithdraw;

        IERC20(token).transfer(msg.sender, amountToWithdraw);
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

    /// @notice function that increases bridged token amount for a given user
    function addBridgedToken(
        address user,
        address token,
        uint amount
    ) external onlyRole(BRIDGE_ROLE) {
        bridgedTokensOfUser[user][token] += amount;
    }

    /// @notice function that withdraws all available bridged token amount for a given user
    function withdrawBridgedToken(address user, address token, uint256 sourcePoolLiquidityAmount)
        external
        onlyRole(BRIDGE_ROLE)
        returns (uint amount)
    {
        uint256 withdrawableTokenAmountBeforeTax = getWithdrawableBridgedTokenAmount(
            user,
            token
        );

        if (withdrawableTokenAmountBeforeTax <= 0) 
            return withdrawableTokenAmountBeforeTax;

        /// @dev here destination liquidity amount is guaranteed to be greater than 0
        uint256 destinationPoolLiquidityAmount = getLiquidityOfToken(token);

        uint256 totalReward = (withdrawableTokenAmountBeforeTax * baseFeePercent) / 100;
        
        uint256 liquidityRatio;
        if(sourcePoolLiquidityAmount > destinationPoolLiquidityAmount) {
            liquidityRatio = sourcePoolLiquidityAmount / destinationPoolLiquidityAmount;
        } else {
            liquidityRatio = destinationPoolLiquidityAmount / sourcePoolLiquidityAmount;
        }

        uint256 rewardForProviders = liquidityRatio * totalReward / totalReward;
        uint256 rewardForBridge = totalReward - rewardForProviders;
        
        totalRewards[token] += rewardForProviders;
        
        uint256 withdrawableTokenAmountAfterTax = withdrawableTokenAmountBeforeTax - totalReward;
        
        bridgedTokensOfUser[user][token] -= withdrawableTokenAmountAfterTax;

        bool status = IERC20(token).transfer(user, withdrawableTokenAmountAfterTax);
        require(status);

    }
}
