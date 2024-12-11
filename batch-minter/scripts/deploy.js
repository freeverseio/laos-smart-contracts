const { ethers } = require("hardhat");

async function main() {

  // The deployer account is specifed in hardhat.config.js, which reads the .env file. It needs to have funds.
  // The owner of the batchMinter is set on deploy, and it can be any address, not necessarily the same as the deployer, not necessarily with funds.
  // This owner will be able to mint, evolve, etc., for which funds will be needed.

  const [deployer] = await ethers.getSigners();
  const owner = deployer.address; // set your choice of owner

  console.log(`Deploying with account ${deployer.address}, with balance (in Wei): ${await ethers.provider.getBalance(deployer.address)}`);

  const LaosBatchMinter = await ethers.getContractFactory("LaosBatchMinter");
  const batchMinter = await LaosBatchMinter.deploy(owner);
  await batchMinter.waitForDeployment();
  console.log("...batchMinter deployed at", await batchMinter.getAddress());

  // Deploy is finished. The remaining code in this script runs sanity checks, verifying that everything is correctly configured. 

  console.log("...batchMinter has expected owner?", owner === await batchMinter.batchMinterOwner());

  const precompileAddress = await batchMinter.precompileAddress();
  console.log("...batchMinter uses a collection managed by the following precompile address:", precompileAddress);

  const EvolutionCollectionInterface = await ethers.getContractAt("EvolutionCollection", precompileAddress);
  const precompileContract = EvolutionCollectionInterface.attach(precompileAddress);

  const precompileOwner = await precompileContract.owner();
  console.log("...the owner of the collection at that precompile address is the newly deployed batchMinter?", await batchMinter.getAddress() === precompileOwner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
