import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CapstoneUSD is ERC20 {
    constructor() ERC20("CapstoneUSD", "cUSD") {
        // Mint some initial tokens for the contract's liquidity pool
        _mint(address(this), 1000000 * 10 ** 18); // 1 million cUSD tokens
    }

    // Mint function to mint new tokens (for simplicity)
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
