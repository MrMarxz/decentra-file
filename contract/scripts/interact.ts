import { ethers } from "hardhat";
import { expect } from "chai";
import { DecentraFile } from "../typechain-types";

async function main() {
    console.log("Deploying DecentraFile contract...");

    const DecentraFileFactory = await ethers.getContractFactory("DecentraFile");
    const decentraFile = await DecentraFileFactory.deploy();

    await decentraFile.waitForDeployment();
    const address = await decentraFile.getAddress()

    console.log("DecentraFile deployed to:", address);

    // Verify deployment by calling a simple view function
    try {
        const fileCount = await decentraFile.getFileCount();
        console.log("Initial file count:", fileCount.toString());
        console.log("Contract successfully deployed and callable");
    } catch (error) {
        console.error("Failed to call contract function after deployment:", error);
    }

    // Log contract address for future use
    // console.log("Use this address for future interactions:", address);

    try {
        console.log("Uploading file...");
        const tx = await decentraFile.uploadFile("QmTest", "TestFile", "Description", "Category", ["tag1", "tag2"]);
        await tx.wait();
        console.log("File uploaded successfully");
    } catch (error) {
        console.error("Failed to upload file:", error);
    }

    // Get count
    try {
        const fileCount = await decentraFile.getFileCount();
        console.log("Total files:", fileCount.toString());
    } catch (error) {
        console.error("Failed to get file count:", error);
    }

    // Get file
    try {
        const file = await decentraFile.getFile(1);
        console.log("File retrieved:", file);
    } catch (error) {
        console.error("Failed to get file:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});