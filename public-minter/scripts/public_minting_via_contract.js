const EvolutionCollectionFactory = artifacts.require("EvolutionCollectionFactory");
const EvolutionCollection = artifacts.require("EvolutionCollection");
const LaosPublicMinter = artifacts.require("LaosPublicMinter");
const truffleAssert = require('truffle-assertions');

const createCollectionAddress = "0x0000000000000000000000000000000000000403";
const maxGas = 10000000;

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

function random32bit() {
  return Math.floor(Math.random() * Math.pow(2, 32));
}

async function mint(contract, sender, recipient) {
  console.log('Minting from ', sender, ' to ', recipient);
  const response = await contract.mintWithExternalURI(recipient, random32bit(), 'dummyURI', {
    from: sender,
  });
  truffleAssert.eventEmitted(response, 'MintedWithExternalURI');
  const tokenId = response.logs[0].args["_tokenId"].toString();
  console.log('new tokenId = ', tokenId);
}

module.exports = async (callback) => {
  try {
    const [alice, bob] = await web3.eth.getAccounts();

    console.log('Querying Alice balance...');
    const aliceBalance = await web3.eth.getBalance(alice);
    console.log('Alice\'s balance:', web3.utils.fromWei(aliceBalance, 'ether'), 'ETH');
    
    console.log('connecting to createCollection precompile...');
    const createCollectionContract = await EvolutionCollectionFactory.at(createCollectionAddress);

    console.log('creating a collection with owner = alice...');
    const response = await createCollectionContract.createCollection(alice);
    const newCollectionAddress = response.logs[0].args["_collectionAddress"];
    console.log('newCollectionAddress at ', newCollectionAddress);
    const precompileContract = await EvolutionCollection.at(newCollectionAddress);
    console.log('precompileContract owner is alice?... ', alice === await precompileContract.owner());

    console.log('alice can mint...');
    await mint(precompileContract, alice, bob);

    console.log('bob cannot mint...');
    await assertReverts(() => mint(precompileContract, bob, alice));

    console.log('deploying publicMinter...');
    const publicMinter = await LaosPublicMinter.new(alice);
    console.log('deploying publicMinter... deployed at ', publicMinter.address);
    console.log('Public Minter owner is alice as expected? ', alice === await publicMinter.publicMinterOwner());

    console.log('set owner of precompile to public minter...');
    await precompileContract.transferOwnership(publicMinter.address);
    console.log('precompileContract owner is publicMinter?... ', publicMinter.address === await precompileContract.owner());

    console.log('setPrecompileAddress of publicMinter to newly created collection...');
    await publicMinter.setPrecompileAddress(newCollectionAddress);
    console.log('Precompile Address matches created collection precompile?...',  newCollectionAddress == await publicMinter.precompileAddress());

    console.log('Precompile owner can be queried via publicMinter and matches direct query? ', await precompileContract.owner() === publicMinter.address);

    console.log('Bob cannot mint using the publicMinter...');
    await assertReverts(() => mint(publicMinter, bob, alice));

    console.log('Bob cannot mint using the precompile neither...');
    await assertReverts(() => mint(precompileContract, bob, alice));

    console.log('alice cannot mint using the precompile neither...');
    await assertReverts(() => mint(precompileContract, alice, bob));

    console.log('alice owns public minter?...',  alice == await publicMinter.publicMinterOwner());

    console.log('alice can mint using the publicMinter since she owns it...');
    await mint(publicMinter, alice, bob);

    console.log('bob is not authorized to enable public minting...');
    await assertReverts(() => publicMinter.enablePublicMinting({from: bob, gas: maxGas}));

    console.log('alice enables public minting...');
    await publicMinter.enablePublicMinting();
    console.log('is public minting enabled?...', await publicMinter.isPublicMintingEnabled());

    console.log('bob can now mint using the publicMinter...');
    await mint(publicMinter, bob, alice);

    console.log('bob cannot mint using the precompile...');
    await assertReverts(() => mint(precompileContract, bob, alice));

    console.log('bob cannot transfer public minting ownership...');
    await assertReverts(() => publicMinter.transferPublicMinterOwnership(bob, {from: bob, gas: maxGas}));

    console.log('alice transfers public minting ownership to bob...');
    await publicMinter.transferPublicMinterOwnership(bob);

    console.log('precompileContract owner remains unchanged as expected?... ', publicMinter.address === await precompileContract.owner());
    console.log('publicMinter owner has changed as expected?... ', bob === await publicMinter.publicMinterOwner());

    console.log('alice cannot disable public minting...');
    await assertReverts(() => publicMinter.disablePublicMinting({from: alice, gas: maxGas}));

    console.log('bob disables public minting...');
    await publicMinter.disablePublicMinting({from: bob, gas: maxGas});

    console.log('alice cannot mint anymore...');
    await assertReverts(() => mint(publicMinter, alice, bob));

    console.log('bob can since he owns the publicMinter...');
    await mint(publicMinter, bob, alice);

    console.log('alice cannot change the owner of the precompile using the precompile...');
    await assertReverts(() => precompileContract.transferOwnership(alice, {from: alice, gas: maxGas}));

    console.log('alice cannot change the owner of the precompile using the publicMinter...');
    await assertReverts(() => publicMinter.transferOwnership(alice, {from: alice, gas: maxGas}));

    console.log('bob changes the ownership of the precompile using the publicMinter...');
    await publicMinter.transferOwnership(alice, {from: bob, gas: maxGas});
    console.log('precompileContract owner is alice?... ', alice === await precompileContract.owner());

    callback();
  } catch (error) {
    console.log(error);
    callback();
  }
};
