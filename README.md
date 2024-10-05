# Decentra - File

![Decentralized Storage Logo](./nextjs/public/decentra.webp)

This project allows users to upload files to a decentralized storage system, where the files are distributed across a network of nodes. The metadata for each file, including information such as file name, size, and upload timestamp, is stored on the blockchain, providing an immutable and verifiable record of the file's details.

## Next.js Setup Instructions

1. Ensure you are using **Node.js v20+** to run the project.
2. Copy the contents of `.env.example` to `.env` and update the environment variables as needed.
3. Install the necessary dependencies by running:

    ```bash
    npm install
    ```

4. Start the development server by running:

    ```bash
    npm run dev
    ```

The project will now be running locally on your machine.

## HardHat Setup Instructions

Run the node locally:

```bash
npx hardhat node
```

Deploy the contract:

```bash
npx hardhat ignition deploy ./ignition/modules/DecentraFileModule.ts
```

Interact with the contract:

```bash
npx hardhat run scripts/interact.ts --network localhost
```

Test the contract:

```bash
npx hardhat test
```
