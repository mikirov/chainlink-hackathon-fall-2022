
/// @notice Bridge contract, deployed on each chain
interface IBridge {
    /// @notice method that locks tokens on ethereum
    /// and sends out a message to polygon
    /// meant to be used by an EOA
    function bridgeToPolygon(address token, uint256 amount) external;

    /// @notice method that locks tokens on polygon
    /// and sends out a message to ethereum
    /// meant to be used by an EOA
    function bridgeToEthereum(address token, uint256 amount) external;
    
    /// @notice method that unlocks tokens on ethereum
    function unlockBridgedToken(
        address token,
        address user,
        uint256 amount
    ) external;
}