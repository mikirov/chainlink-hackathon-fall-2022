// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "./interfaces/ILiquidityPool.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LiquidityPool is ILiquidityPool, ReentrancyGuard, AccessControl, Pausable {
    
    /// @notice token to total volume mapping
    mapping(address => uint256) public totalLiquidity;

    /// @notice user to token to balance mapping
    mapping(address => mapping(address => uint256)) public userLiquidity;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    error DoesNotSupportPermit(address token);
    error DoesNotSupportERC20(address token);
    error NotEnoughAllowance(uint256 expected, uint256 actual);
    error NotEnoughFunds(uint256 expected, uint256 actual);

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Unlock(address indexed user, address indexed token, uint256 amount);

    constructor(address owner, address bridge) {
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);
        _setupRole(BRIDGE_ROLE, bridge);
    }

    function getTotalLiquidity(address token)
        external
        view
        returns (uint256)
    {
        return totalLiquidity[token];
    }

    function getBalanceOf(address user, address token)
        external
        view
        returns (uint256)
    {
        return userLiquidity[user][token];
    }

    /// @notice function that permits and deposits an ERC20 token to the contract
    function depositPermit(
        address token,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if(!IERC165(token).supportsInterface(type(IERC20Permit).interfaceId))
            revert DoesNotSupportPermit(token);

        IERC20Permit(token).permit(msg.sender, address(this), amount, deadline, v, r, s);
        _deposit(token, amount, msg.sender);
    }

    function deposit(address tokenAddress, uint256 amount) external {
       _deposit(tokenAddress, amount, msg.sender);
    }

    function _deposit(address tokenAddress, uint256 amount, address depositor) internal {
        if(!IERC165(tokenAddress).supportsInterface(type(IERC20).interfaceId))
            revert DoesNotSupportERC20(tokenAddress);
        
        IERC20 token = IERC20(tokenAddress);

        /// @dev make sure the depositor actually has the funds to deposit
        if(token.balanceOf(msg.sender) < amount) 
            revert NotEnoughFunds(amount, token.balanceOf(msg.sender));
        

        if(token.allowance(depositor, address(this)) < amount)
            revert NotEnoughAllowance(amount, token.allowance(depositor, address(this)));

        bool success = token.transferFrom(depositor, address(this), amount);
        require(success);

        totalLiquidity[tokenAddress] += amount;
        userLiquidity[depositor][tokenAddress] += amount;

        emit Deposit(depositor, tokenAddress, amount);
    }

    /// @notice method that withdraws tokens from the liquidity pool
    /// @dev this method is not meant to be called by EOA
    /// the reentrancy guard can be removed to save some gas since we are following
    /// the check-effects-interactions pattern
    function withdraw(address token, uint256 amount) external nonReentrant whenNotPaused {
        if(userLiquidity[msg.sender][token] < amount)
            revert NotEnoughFunds(amount, userLiquidity[msg.sender][token]);

        userLiquidity[msg.sender][token] -= amount;

        unlockTokenTo(token, msg.sender, amount);
    }

    /// @notice unlock specified amount of token from the liquidity pool to the user address on the target chain
    /// method is meant to be called by the bridge contract
    function unlockTokenTo(
        address tokenAddress,
        address user,
        uint256 amount
    ) public onlyRole(BRIDGE_ROLE) whenNotPaused {
        if(totalLiquidity[tokenAddress] < amount)
            revert NotEnoughFunds(amount, totalLiquidity[tokenAddress]);

        totalLiquidity[tokenAddress] -= amount;

        bool success = IERC20(tokenAddress).transfer(user, amount);
        require(success);

        emit Unlock(msg.sender, tokenAddress, amount);
    }

    /// @notice emergency pause method that can be called by the owner
    function pause() external whenNotPaused onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external whenPaused onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}