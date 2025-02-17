const { ethers } = require("hardhat");

async function main() {

  // The deployer account is specifed in hardhat.config.js, which reads the .env file. It needs to have funds.
  // The owner of the minter is set on deploy, and it can be any address, not necessarily the same as the deployer, not necessarily with funds.
  // This owner will be able to mint, evolve, etc., for which funds will be needed.

  const [deployer] = await ethers.getSigners();
  const owner = deployer.address; // set your choice of owner

  console.log("========================================");
  console.log(`🚀 Deploying contract with account: ${deployer.address}`);
  console.log(`💰 Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))}`);
  console.log("========================================\n");
  
  const LAOSMinterControlled = await ethers.getContractFactory("LAOSMinterControlled");
  const minter = await LAOSMinterControlled.deploy(owner);
  await minter.waitForDeployment();
  
  console.log("✅ Deployment successful!");
  console.log("────────────────────────────────────────");
  console.log(`📌 LAOSMinterControlled deployed at:      ${await minter.getAddress()}`);
  
  const precompileAddress = await minter.precompileAddress();
  console.log(`📌 Precompile collection managed at:       ${precompileAddress}`);
  console.log("────────────────────────────────────────\n");
  console.log("🎉 Deployment completed successfully! 🚀");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
