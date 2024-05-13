const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers, upgrades } = require("hardhat");

// Hardhat Ignition does not provide explicit proxy contract support. 
// Hence, the deployment is done using the script below
async function main() {
    const UpgradeableERC20Swapper = await ethers.getContractFactory("ERC20Swapper");
    const swapper = await upgrades.deployProxy(UpgradeableERC20Swapper, [], { initializer: 'initialize', kind: 'uups' });
    await swapper.waitForDeployment();

    let swapperAddress = await swapper.getAddress();
    // deployProxy returns a contract instance with the proxy address and the implementation interface.
    console.log("Swapper deployed to:", swapperAddress);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });