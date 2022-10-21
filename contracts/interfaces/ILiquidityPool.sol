interface ILiquidityPool {
    function getBalanceOf(address user, address token)
        external
        view
        returns (uint256);

    function getTotalLiquidity(address token) external view returns (uint256);

    function deposit(address tokenAddress, uint256 amount) external;

    function depositPermit(
        address token,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function unlockTokenTo(
        address tokenAddress,
        address user,
        uint256 amount
    ) external;

    function withdrawFunds(address token, uint256 amount) external;

    function withdrawLiquidity(address token, uint256 amount) external;

    function pause() external;

    function unpause() external;

    function addToFunds(
        address token,
        address user,
        uint256 amount
    ) external;

    function totalLiquidity(address) external view returns (uint256);
}
