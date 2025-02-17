const { ethers } = require("hardhat");

async function main() {

  // The deployer account is specifed in hardhat.config.js, which reads the .env file. It needs to have funds.
  // The owner of the minter is set on deploy, and it can be any address, not necessarily the same as the deployer, not necessarily with funds.
  // This owner will be able to mint, evolve, etc., for which funds will be needed.

  const [deployer] = await ethers.getSigners();
  const owner = deployer.address; // set your choice of owner

  console.log(`Deploying with account ${deployer.address}, with balance (in Wei): ${await ethers.provider.getBalance(deployer.address)}`);

  const LAOSMinterControlled = await ethers.getContractFactory("LAOSMinterControlled");
  const minter = await LAOSMinterControlled.deploy(owner);
  await minter.waitForDeployment();
  console.log("...minter deployed at", await minter.getAddress());

  // Deploy is finished. The remaining code in this script runs sanity checks, verifying that everything is correctly configured. 

  console.log("...minter has expected owner?", owner === await minter.batchMinterOwner());

  const precompileAddress = await minter.precompileAddress();
  console.log("...minter uses a collection managed by the following precompile address:", precompileAddress);

  const EvolutionCollectionInterface = await ethers.getContractAt("EvolutionCollection", precompileAddress);
  const precompileContract = EvolutionCollectionInterface.attach(precompileAddress);

  const precompileOwner = await precompileContract.owner();
  console.log("...the owner of the collection at that precompile address is the newly deployed minter?", await minter.getAddress() === precompileOwner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
