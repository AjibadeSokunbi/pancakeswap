const express = require('express')
const Web3 = require('web3');

const app = express()
// abi of pancakepair contract
const contractabi = require("./pancake.json")

// contract address of pancakeswap contract
const contractAddress = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';

// http provider configuration
const url = 'https://bsc.getblock.io/06a86944-96a1-4d4f-bd5a-da3e066cf731/mainnet/';

const web3 = new Web3(new Web3.providers.HttpProvider(url));
const contract = new web3.eth.Contract(contractabi, contractAddress);

const port = 3000;

app.get('/userActivity', async (req, res) => {
  try {
    const address = req.params.address;

    // Start from block 24388485
    let fromBlock = 10000;
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
      // Increment the fromBlock by 10000 for the next iteration
      fromBlock += 10000;
    }

    // Process the events
    const activity = events.map(event => ({
      pool: event.returnValues.pid,
      amount: event.returnValues.amount
    }));

    // Get all the pool addresses
    const poolAddresses = activity.map(item => item.pool);

    res.send({
      pools: poolAddresses,
      activity
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// start server
app.listen(port, () => {
  console.log(`server listening on port ${port}`)
});
