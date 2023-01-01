const express = require('express');
const Web3 = require('web3');

const app = express();

// abi of pancakeswap master chef contract
const contractabi = require("./pancake.json")

// contract address of pancakeswap master chef contract
const contractAddress = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';

// http provider configuration
const url = 'https://bsc.getblock.io/06a86944-96a1-4d4f-bd5a-da3e066cf731/mainnet/';

const web3 = new Web3(new Web3.providers.HttpProvider(url));
const contract = new web3.eth.Contract(contractabi, contractAddress);

app.get('/userActivity', async (req, res) => {
  try {
    const address = req.params.address;
    //1. Get all the pools the user has deposited tokens to
    const poolAddresses = await contract.getPastEvents('Deposit', {
      filter: { from: address },
      fromBlock: 0,
      toBlock: 'latest'
    }).then(events => events.map(event => event.returnValues.pid));
    // the pid is the the pool address, it is returned in the event

    //2. Get the total token amount the user has deposited in each pool
    // const poolBalances = await (poolAddresses.map(poolAddress => {
    //   return contract.methods.balanceOf(address, poolAddress).call();
    // }));

    //3. Get every instance where the user deposited or withdrew from a pool
    const activity = await contract.getPastEvents(['Deposit', 'Withdraw'], {
      filter: { from: address },
      fromBlock: 0,
      toBlock: 'latest'
    }).then(events => events.map(event => ({
      pool: event.returnValues.pid,
      amount: event.returnValues.amount
    })));

    res.send({
      pools: poolAddresses,
      activity
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

//start
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
