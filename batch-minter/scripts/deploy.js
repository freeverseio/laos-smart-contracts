const { ethers } = require("hardhat");

const typicalURILength = "ipfs://QmQeN4qhzPpG6jVqJoXo2e86eHYPbFpKeUkJcTfrA5hJwz".length; // = 47

async function main() {
  const [deployer] = await ethers.getSigners();
  const owner = deployer.address; // set your choice of owner, not necessearily the same as the deployer account

  console.log("Deployer's balance (in Wei):", await ethers.provider.getBalance(deployer.address));

  console.log("Deploying batchMinter with owner...", owner);

  const LaosBatchMinter = await ethers.getContractFactory("LaosBatchMinter");
  const batchMinter = await LaosBatchMinter.deploy(deployer.address);
  await batchMinter.waitForDeployment();

  console.log("...batchMinter deployed at", await batchMinter.getAddress());

  const batchMinterOwner = await batchMinter.batchMinterOwner();
  console.log("...batchMinter expected owner?", owner === batchMinterOwner);

  const precompileAddress = await batchMinter.precompileAddress();
  console.log("Precompile address is", precompileAddress);

  const EvolutionCollection = await ethers.getContractAt("EvolutionCollection", precompileAddress);
  const precompileContract = EvolutionCollection.attach(precompileAddress);

  const precompileOwner = await precompileContract.owner();

  console.log("...precompileContract owner is batchMinter?", await batchMinter.getAddress() === precompileOwner);
  console.log(await batchMinter.getAddress(), precompileOwner);

  console.log(
    "Precompile owner can be queried via batchMinter and matches direct query?",
    precompileOwner === await batchMinter.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
