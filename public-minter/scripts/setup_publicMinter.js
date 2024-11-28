const EvolutionCollection = artifacts.require("EvolutionCollection");
const LaosPublicMinter = artifacts.require("LaosPublicMinterMinimal");
const truffleAssert = require('truffle-assertions');

// This script configures and existing precompile collection to be owned by a LAOSPublicMinterMinimal contract
// polgygon = 0xfffffffffffffffffffffffe000000000000000d, ethereum = 0xfffffffffffffffffffffffe000000000000000e
// const existingCollectionAddress = "0xfffffffffffffffffffffffe000000000000000d";
const maxGas = 5000000;

function random32bit() {
  return Math.floor(Math.random() * Math.pow(2, 32));
}

async function mint(contract, sender, recipient) {
  const response = await contract.mintWithExternalURI(recipient, random32bit(), 'dummyURI', {
    from: sender,
    gas: maxGas,
  });
  truffleAssert.eventEmitted(response, 'MintedWithExternalURI');
  const tokenId = response.logs[0].args["_tokenId"].toString();
  console.log('new tokenId = ', tokenId);
}

module.exports = async (callback) => {
  try {
    // Alice must be the owner of the current precompile collection
    const [alice, bob] = await web3.eth.getAccounts();
    console.log('Alice, Bob = ', alice);

    console.log('Deploying publicMinter with alice as owner...');
    const publicMinter = await LaosPublicMinter.new(alice);
    console.log('...publicMinter deployed at ', publicMinter.address);
    console.log('...publicMinter owner is alice as expected? ', alice === await publicMinter.publicMinterOwner());

    const precompileAddress = await batchMinter.precompileAddress();
    const precompileContract = await EvolutionCollection.at(precompileAddress);

    console.log('...precompileContract owner is publicMinter?... ', publicMinter.address === await precompileContract.owner());

    console.log('Precompile owner can be queried via publicMinter and matches direct query? ', await precompileContract.owner() === publicMinter.address);

    console.log('Bob can mint using the publicMinter...');
    await mint(publicMinter, bob, alice);

    callback();
  } catch (error) {
    console.log(error);
    callback();
  }
};
