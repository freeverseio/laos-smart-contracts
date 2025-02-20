require("dotenv").config();
const { ethers } = require("ethers");

if (!process.env.PRIVATE_KEY || !process.env.SECOND_PRIVATE_KEY) {
  throw new Error("Please set PRIVATE_KEY and SECOND_PRIVATE_KEY in your .env file.");
}

// Network RPC URL (Update to match your network)
const RPC_URL = "https://rpc.laos.laosfoundation.io"; 
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Load wallets manually
const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const bob = new ethers.Wallet(process.env.SECOND_PRIVATE_KEY, provider);

// Constants
const nTXsInBatch = 2;
const typicalURILength = "ipfs://QmQeN4qhzPpG6jVqJoXo2e86eHYPbFpKeUkJcTfrA5hJwz".length; // = 47
const dummyString = "a".repeat(typicalURILength);

async function batchMint(contract, recipient, uriLen = typicalURILength, num = nTXsInBatch) {
  console.log("...Batch Minting", num, "assets with tokenURI length", uriLen);

  const recipients = [
    "0x235b63b6b21d9d6b9d8d52c23019adb5e12a3c76",
    "0x235b63b6b21d9d6b9d8d52c23019adb5e12a3c76",
  ];
  const randoms = ["39464586666829774860226153774", "6256473065996824358369636327"];
  const uris = [
    "ipfs://QmWvnQwRZ7D5eKzoXuNCd6WzbjwaeAnb3iGXYtYFozpmid",
    "ipfs://QmVfPhc1PyaEFpYusEhcxwiKs8bY7KyR8AcFnDAfenxT1k",
  ];

  const tx = await contract.mintWithExternalURIBatch(recipients, randoms, uris);
  const receipt = await tx.wait();

  console.log(`✅ Gas used for minting: ${receipt.gasUsed.toString()}`);
  console.log(`✅ Gas used per mint: ${Number(receipt.gasUsed) / num}`);

  const tokenId0 = receipt.logs[0].args[2].toString();
  const tokenIdLast = receipt.logs[receipt.logs.length - 1].args[2].toString();
  console.log("🎯 First produced tokenId =", tokenId0);
  console.log("🎯 Last produced tokenId =", tokenIdLast);
}

async function main() {
  console.log("========================================");
  console.log(`🚀 Deploying with account: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await provider.getBalance(deployer.address))} ETH`);
  console.log("========================================\n");

  // Deploy contract
  const LaosBatchMinterFactory = new ethers.ContractFactory(
    require("../artifacts/contracts/LaosBatchMinter.sol/LaosBatchMinter.json").abi,
    require("../artifacts/contracts/LaosBatchMinter.sol/LaosBatchMinter.json").bytecode,
    deployer
  );

  const batchMinter = await LaosBatchMinterFactory.deploy(deployer.address);
  await batchMinter.waitForDeployment();
  console.log(`✅ LaosBatchMinter deployed at: ${await batchMinter.getAddress()}`);

  console.log(`👤 Bob will be the recipient (${bob.address})`);
  console.log(`💰 Bob's balance: ${ethers.formatEther(await provider.getBalance(bob.address))} ETH`);

  console.log("\n🔄 Deployer can batch mint using the batchMinter...");
  await batchMint(batchMinter, bob.address);
}

main().catch((error) => {
  console.error("❌ An unexpected error occurred:", error.message);
  process.exit(1);
});
