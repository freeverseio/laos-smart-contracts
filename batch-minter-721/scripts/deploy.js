const EvolutionCollection = artifacts.require("EvolutionCollection");
const LaosBatchMinter = artifacts.require("LaosBatchMinter721");

module.exports = async (callback) => {
  try {
    const [alice] = await web3.eth.getAccounts();
    const owner = '0xA294b262b8B015739C3810cF52101e7C06D4FB6e';

    console.log('Deploying batchMinter with (deployer, owner) =', alice, owner);
    const batchMinter = await LaosBatchMinter.new(owner);
    console.log('...batchMinter deployed at ', batchMinter.address);
    console.log('...batchMinter owner is as expected? ', owner === await batchMinter.batchMinterOwner());

    const precompileAddress = await batchMinter.precompileAddress();
    const precompileContract = await EvolutionCollection.at(precompileAddress);

    console.log('...precompile contract owner is batchMinter?... ', batchMinter.address === await precompileContract.owner());
    console.log('...precompile owner can be queried via batchMinter and matches direct query? ', await precompileContract.owner() === batchMinter.address);

    console.log('DONE');
    return;
    callback();

  } catch (error) {
    console.log(error);
    callback();
  }
};
