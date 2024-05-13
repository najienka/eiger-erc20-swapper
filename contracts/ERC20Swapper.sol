// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {IERC20Swapper, ISwapRouter02, IERC20, IWETH} from "./Interfaces.sol";

contract ERC20Swapper is IERC20Swapper, UUPSUpgradeable, OwnableUpgradeable {
    // Sepolia testnet addresses for uniswap v3
    address constant SWAP_ROUTER_02 =
        0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E;
    address payable constant WETH = payable(0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14);
    address private constant DAI = 0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357;

    ISwapRouter02 private constant router = ISwapRouter02(SWAP_ROUTER_02);
    IWETH private constant weth = IWETH(WETH);
    IERC20 private constant dai = IERC20(DAI);
    uint24 private constant feeTier = 3000;

    event SwapCompleted(address indexed token, uint amountOut);

    error MinAmountCannotBeZero();
    error OnlyDAITokenOutSupported();
    error ETHWrappingFailed();

    /// CONSTRUCTOR and INITIALIZER
    // To prevent the implementation contract from being used, 
    // we invoke the _disableInitializers function in the constructor to automatically 
    // lock it when it is deployed.

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // The initialize function will be used to set up the initial state of the contract.
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    /// EXTERNAL
    
    function swapEtherToToken(
        address token,
        uint minAmount
    ) external payable returns (uint amountOut) {
        if(token != DAI) revert OnlyDAITokenOutSupported();
        if(minAmount == 0) revert MinAmountCannotBeZero();
        amountOut = swapExactInputSingleHop(msg.value, minAmount);
        emit SwapCompleted(token, amountOut);
        return amountOut;
    }

    /// INTERNAL 

    function swapExactInputSingleHop(
        uint256 amountIn,
        uint256 amountOutMin
    ) internal returns (uint amountOut) {
        // wrap amountIn from eth to weth
        weth.deposit{value: amountIn}();
        // approve weth for router to debit from contract
        weth.approve(address(router), amountIn);
        // check contract weth balance >= amountIn
        if (weth.balanceOf(address(this)) < amountIn) revert ETHWrappingFailed();

        ISwapRouter02.ExactInputSingleParams memory params = ISwapRouter02
            .ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: DAI,
                fee: feeTier,
                recipient: msg.sender,
                amountIn: amountIn,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0
            });

        return router.exactInputSingle(params);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
