//
// Script that tests using proxy contracts to create a collection and mint
// To mint, the owner of the collection must be set to the proxy contract
//
// To run this script, compile first
//      ./node_modules/.bin/truffle compile
// and then execute:
//      ./node_modules/.bin/truffle exec scripts/test_flow.js  --network zombienet
//
// All commands here can be done 1-by-1, manually, by doing:
//      ./node_modules/.bin/truffle console --network zombienet
const CreateCollectionProxy = artifacts.require("CreateCollectionProxy");
const LaosPublicMinter = artifacts.require("LaosEvolutionPublicMinting");

module.exports = async (callback) => {
  try {
    console.log('createCollectionContract...');
    const createCollectionContract = await CreateCollectionProxy.new();
    console.log('createCollectionContract at ', createCollectionContract.address);

    console.log('createAssetsContract...');
    const createAssetsContract = await LaosPublicMinter.new();
    console.log('createAssetsContract at ', createAssetsContract.address);

    console.log('createCollection...');
    const response = await createCollectionContract.createCollection(createAssetsContract.address);
    const newCollectionAddress = response.logs[0].args["_collectionAddress"];
    console.log('newCollectionAddress at ', newCollectionAddress);

    console.log('setPrecompileAddress...');
    await createAssetsContract.setPrecompileAddress(newCollectionAddress);

    const collectionOwner = await createAssetsContract.owner();
    console.log('Collection owner coincides with createAssetsContract? ', collectionOwner === createAssetsContract.address);

    const dummyRecipient = collectionOwner;
    console.log('mintWithExternalURI...');
    try {
      await createAssetsContract.mintWithExternalURI(dummyRecipient, 342346, 'dummyURI');
      console.log('ERROR: minting worked without being whitelisted!!!');
    } catch {
      console.log('Minting failed as expected, since the sender is not whitelisted');
    }

    console.log('whitelisting sender...');
    const accounts = await web3.eth.getAccounts();
    await createAssetsContract.allow(accounts[0]);

    console.log('mintWithExternalURI... again');
    const response2 = await createAssetsContract.mintWithExternalURI(dummyRecipient, 342346, 'dummyURI');
    const tokenId = response2.logs[0].args["_tokenId"].toString();
    console.log('new tokenId = ', tokenId);
    callback();
  } catch (error) {
    console.log(error);
    callback();
  }
};