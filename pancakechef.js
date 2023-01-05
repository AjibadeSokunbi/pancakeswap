const express = require('express');
const app = express();
const Web3 = require('web3');

// abi of pancakeswap masterstaking contract
const contractabi = require("./pancake.json")

// contract address of pancakeswap masterstaking contract
const contractAddress = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';

// http provider configuration
const url = 'https://bold-black-energy.bsc.discover.quiknode.pro/c2bf115e5d95e1ee7a40bef1eb2e9bef41222bfb/';

const web3 = new Web3(new Web3.providers.HttpProvider(url));
const contract = new web3.eth.Contract(contractabi, contractAddress);

app.get('/user-activity/:address', async (req, res) => {
  try {
    const address = req.params.address;

    // Start from block 20000000
    let fromBlock = 20000000;
    // Get the current block height
    const currentBlock = await web3.eth.getBlockNumber();

    // Array to store all the events
    let events = [];
    while (fromBlock < currentBlock) {
      // Get the events in the next 10,000 blocks
      const blockEvents = await contract.getPastEvents(['Deposit', 'Withdraw'], {
        filter: { from: address },
        fromBlock: fromBlock,
        toBlock: fromBlock + 10000
      });
      // Add the events to the array
      events = events.concat(blockEvents);
      // Increment the fromBlock by 10000 
      fromBlock += 10000;
    }

    // Process the events
    const activity = events.map(event => ({
        type: event.event === 'Deposit' ? 'deposit' : 'withdrawal',
        pool: event.returnValues.pid,
        amount: event.returnValues.amount
      }));

    // Get all the pool addresses
    const poolAddresses = new Set(activity.map(item => item.pool));

    // total deposited
    // const poolBalances = await (poolAddresses.map(poolAddress => {
    //   return contract.methods.balanceOf(address, poolAddress).call();
    // }));

    res.send({
      pools: [...poolAddresses],
      activity,
      // poolBalances
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Something went wrong' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
