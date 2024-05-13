const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

const ERC20ABI = [
    "function balanceOf(address owner) view returns (uint256)",
]

describe("ERC20Swapper", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployERC20SwapperFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const UpgradeableERC20Swapper = await ethers.getContractFactory("ERC20Swapper");
        const swapper = await upgrades.deployProxy(UpgradeableERC20Swapper, [], { initializer: 'initialize', kind: 'uups'}); 
        await swapper.waitForDeployment();

        let swapperAddress = await swapper.getAddress();

        console.log("Swapper deployed to:", swapperAddress);
        return { swapper, swapperAddress, owner, otherAccount };
    }

    describe("Swap", function () {
        it("Should set a valid deployment address", async function () {
            const { swapper, } = await loadFixture(deployERC20SwapperFixture);
            expect(swapper.address).to.not.equal(ethers.ZeroAddress);
        });

        it("Should swap eth for dai", async function () {
            const { swapper, swapperAddress, owner } = await loadFixture(deployERC20SwapperFixture);
            const DAI_ADDRESS = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";
            const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

            const WETH = new ethers.Contract(WETH_ADDRESS, ERC20ABI, ethers.provider);
            const DAI = new ethers.Contract(DAI_ADDRESS, ERC20ABI, ethers.provider);

            let DAIBalancePreSwap = await DAI.balanceOf(owner.address);

            expect(await WETH.balanceOf(swapperAddress)).to.eq(0);

            const tx = await swapper.swapEtherToToken(
                "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
                "1",
                {value: ethers.parseEther("0.001")}
            );
            const receipt = await tx.wait();
            // A receipt status can have a value of 0 or 1 which translate into: 
            // 0 transaction has failed (for whatever reason) 1 transaction was succesful.
            expect(receipt.status).to.be.equal(1);

            console.log(`Transaction status: ${receipt.status}`);
            console.log(`Transaction Hash: ${receipt.hash}`);

            expect(await WETH.balanceOf(swapperAddress)).to.eq(0);

            const DAIBalancePostSwap = await DAI.balanceOf(owner.address);
            expect(parseFloat(ethers.formatEther(DAIBalancePostSwap))).to.be.gt(parseFloat(ethers.formatEther(DAIBalancePreSwap)));
        });
    });
});
