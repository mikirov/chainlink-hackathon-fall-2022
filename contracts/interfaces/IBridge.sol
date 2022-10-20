/// @notice Bridge contract, deployed on each chain
interface IBridge {
    /// @notice method that locks tokens
    /// and sends out a message to other chain
    /// meant to be used by an EOA
    function bridgeToken(address token, uint256 amount) external;
}
