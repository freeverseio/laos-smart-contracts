const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deployer address: ${deployer.address}`);

  console.log(`Deploying with account ${deployer.address}, with balance (in Wei): ${await ethers.provider.getBalance(deployer.address)}`);

  const sendEther = async (from, to, amount) => {
    console.log('Sending transaction...');
    const tx = await from.sendTransaction({
      to,
      value: amount,
    });
    await tx.wait();
    console.log(`Transaction hash: ${tx.hash}`);
  };

  for (let i = 0; i < 20; i++) {
    console.log(`sending number ${i}`);
    await sendEther(deployer, deployer.address, BigInt(16n));
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });