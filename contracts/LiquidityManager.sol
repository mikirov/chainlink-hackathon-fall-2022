// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract LiquidityManager is AccessControl {
    /// @notice mapping that holds the total liquidity added by an account
    /// account => token => amount
    mapping(address => mapping(address => uint)) public liquidityOfUser;

    /// @notice mapping that holds the total amount of tokens, the user has bridged but still not withdrawn
    /// account => token => amount
    mapping(address => mapping(address => uint)) public bridgedTokensOfUser;

    address public bridge;

    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    error TransferFailed(address token, uint amount);
    error InsufficientLiquidity(uint amount);

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
        return liquidityOfUse[user][token];
    }

    /// @notice function that increases liquidity for a given token
    function addLiquidity(address token, uint amount) external {
        bool status = IERC20(token).transferFrom(
            msg.sender,
            address(this),
            amount
        );

        liquidityOfUser[msg.sender][token] += amount;

        if (status == false) revert TransferFailed(token, amount);
    }

    /// @notice function that decreases liquidity for a given token
    function removeLiquidity(address token, uint amount) external {
        if (
            getLiquidityOfToken(token) < amount ||
            getLiquidityOfUser(msg.sender, token) < amount
        ) {
            revert InsufficientLiquidity(amount);
        }

        liquidityOfUser[msg.sender][token] -= amount;

        IERC20(token).transfer(msg.sender, amount);
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
    function withdrawBridgedToken(
        address user,
        address token,
    ) external onlyRole(BRIDGE_ROLE) returns(uint amount) {
        uint withdrawableTokenAmount = getWithdrawableBridgedTokenAmount(user, token); 

        if (withdrawableTokenAmount > 0) {
            bridgedTokensOfUser[user][token] -= withdrawableTokenAmount;

            bool status = IERC20(token).transfer(user, withdrawableTokenAmount);

            if (status == false) revert TransferFailed(token, amount);
        }

        return withdrawableTokenAmount;
    }
}
