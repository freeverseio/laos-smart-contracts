const EvolutionCollection = artifacts.require("EvolutionCollection");
const LaosBatchMinter = artifacts.require("LaosBatchMinter721");

async function assertReverts(asyncFunc, retries = 10, delay = 10000) {
  let attempts = 0;

  while (attempts < retries) {
    try {
      console.log(`Attempt ${attempts + 1}...`);
      await asyncFunc(); // Call the async function
      console.log('Transaction did not revert, retrying...');
      attempts++;
      await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
    } catch (error) {
      if (error.message.includes('revert')) {
        console.log('Transaction reverted as expected.');
        return;
      } else {
        console.log(`Error encountered: ${error.message}`);
        console.log('Retrying due to a non-revert error...');
        attempts++;
        await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
      }
    }
  }

  throw new Error('Transaction did not revert after maximum retries');
}

module.exports = async (callback) => {
  try {
    const [alice] = await web3.eth.getAccounts();
    const bob = '0xF8d7E10116412B68A4A952F3F5DDC288E9Cf6105';

    console.log('Deploying batchMinter with alice as owner...', alice);
    const batchMinter = await LaosBatchMinter.new(alice);
    console.log('...batchMinter deployed at ', batchMinter.address);
    console.log('...batchMinter owner is alice as expected? ', alice === await batchMinter.batchMinterOwner());

    const precompileAddress = await batchMinter.precompileAddress();
    const precompileContract = await EvolutionCollection.at(precompileAddress);

    console.log('...precompile contract owner is batchMinter?... ', batchMinter.address === await precompileContract.owner());
    console.log('...precompile owner can be queried via batchMinter and matches direct query? ', await precompileContract.owner() === batchMinter.address);

    console.log('Alice can mint using mintTo...');
    await batchMinter.mintTo(alice, 'aaa');

    console.log('Alice can batch mint using the batchMinter...');
    const tokenIdRnd = 123524534;
    await batchMinter.mintWithExternalURIBatch([alice], [tokenIdRnd], ['aaa']);
  
    console.log('Bob tries to transfer to Alice... (should fail)');
    await assertReverts(
      () => batchMinter.transferFrom(alice, bob, tokenIdRnd)
    );

    console.log('DONE');return;
    callback();

  } catch (error) {
    console.log(error);
    callback();
  }
};
