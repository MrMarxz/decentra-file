import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";
import "@typechain/hardhat";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    hardhat: {
      chainId: 1337
    },
    // 'base-sepolia': {
    //   url: 'https://sepolia.base.org',
    //   accounts: [process.env.WALLET_KEY as string],
    //   gasPrice: 1000000000,
    // },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  // Add this section to include OpenZeppelin contracts
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
