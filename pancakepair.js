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

app.get('/api/:userAddress', (req, res) => {
  // get the user address from the request parameters
  const userAddress = req.params.userAddress

  // get the pair addresses that the user has created or provided tokens to
  contract.getPastEvents(['PairCreated','Mint'], {
    filter: {
      sender: userAddress,
    }
  }, (error, events) => {
    if (error) {
      console.error(error)
      res.sendStatus(500)
      return
    }

    // map the events to just the pair addresses
    const pairs = events.map(event => event.returnValues.pair)

    // get the total amount of tokens the user has provided to the pairs
    contract.getPastEvents('Mint', {
      filter: {
        sender: userAddress
      }
    }, (error, events) => {
      if (error) {
        console.error(error)
        res.sendStatus(500)
        return
      }

      // sum the amount of tokens provided in each event
      let totalTokensProvided = 0
      events.forEach(event => {
        totalTokensProvided += event.returnValues.amount0 + event.returnValues.amount1
      })

      // get the instances where the user provided or withdrew tokens from a liquidity pool or pair
      contract.getPastEvents(['Mint', 'Burn', 'Swap'], {
        filter: {
          sender: userAddress
        }
      }, (error, events) => {
        if (error) {
          console.error(error)
          res.sendStatus(500)
          return
        }

        // send the results as a response
        res.send({
          pairs,
          totalTokensProvided,
          events
        })
      })
    })
  })
})

app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})