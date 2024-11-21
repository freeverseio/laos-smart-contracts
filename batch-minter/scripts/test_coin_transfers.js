module.exports = async (callback) => {
  try {
    const [alice, bob] = await web3.eth.getAccounts();

    let balance;
    balance = await web3.eth.getBalance(alice);
    console.log(`Deployer is ${alice} and has balance (in wei):`, balance.toString());

    balance = await web3.eth.getBalance(alice);
    console.log(`Deployer is ${alice} and has balance (in wei):`, balance.toString());

    balance = await web3.eth.getBalance(alice);
    console.log(`Deployer is ${alice} and has balance (in wei):`, balance.toString());

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    console.log('seding');
    await web3.eth.sendTransaction({from: alice, to: alice, value: web3.utils.toWei('0.1', 'ether')});

    callback();
  } catch (error) {
    console.log(error);
    callback();
  }
};
