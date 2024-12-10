const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const owner = deployer.address; // set your choice of owner, not necessearily the same as the deployer account

  console.log(`Deploying with account ${owner}, with balance (in Wei): ${await ethers.provider.getBalance(deployer.address)}`);

  const LaosBatchMinter = await ethers.getContractFactory("LaosBatchMinter");
  const batchMinter = await LaosBatchMinter.deploy(owner);
  await batchMinter.waitForDeployment();
  console.log("...batchMinter deployed at", await batchMinter.getAddress());
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
