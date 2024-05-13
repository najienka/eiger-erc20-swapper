# Sample ERC-20 swapping contract

This project demonstrates a sample ERC-20 swapping contract which is upgradeable and uses Uniswap V3 SwapRouter02 for swapping ETH for a minimum amount of DAI tokens on Sepolia. It comes with a sample contract, unit tests for that contract, and a Hardhat deployment script that deploys that contract.

To setup the project, clone the repo and create a `.env` file following the same structure in the `.env.example` file in the project root folder.

Install the project dependencies using the following command: 

```shell
npm install
```

All the unit tests are executed on a fork of the Sepolia testnet.

The following command runs the unit tests:

```shell
npx hardhat test
```

The following command is used to deploy the contract onto the Sepolia testnet:

```shell
npx hardhat run scripts/ERC20Swapper.js --network sepolia
```

The proxy and implementation smart contracts are all deployed and verified on the Sepolia testnet.
The proxy smart contract is deployed on Sepolia at: [0x1f0D7180bdDe991d20fA8F2d208BB027d8911124](https://sepolia.etherscan.io/address/0x1f0D7180bdDe991d20fA8F2d208BB027d8911124)
The implementation smart contract is deployed on Sepolia at: [0x28D4a9Fc706Eb095563adC8EcCF46FE334370F6B](https://sepolia.etherscan.io/address/0x28D4a9Fc706Eb095563adC8EcCF46FE334370F6B)