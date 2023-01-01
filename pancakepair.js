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

app.get('/api/:userAddress', async (req, res) => {
  try {
    const userAddress = req.params.userAddress

    //first i get all events where the user was the sender
    const events = await contract.getPastEvents('allEvents', {
      filter: {
        sender: userAddress
      }
    });

    // then i filter events by type
    const pairCreatedEvents = events.filter(event => event.event === 'PairCreated');
    const mintEvents = events.filter(event => event.event === 'Mint');
    const burnEvents = events.filter(event => event.event === 'Burn');

    // map PairCreated events to just the pair addresses
    const pairs = pairCreatedEvents.map(event => event.returnValues.pair);

    // sums the amount of tokens provided in each Mint event
    let totalTokensProvided = 0;
    mintEvents.forEach(event => {
      totalTokensProvided += event.returnValues.amount0 + event.returnValues.amount1;
    });

    // response
    res.send({
      pairs,
      totalTokensProvided,
      events: [...mintEvents, ...burnEvents]
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// start server
app.listen(port, () => {
  console.log(`server listening on port ${port}`)
});
