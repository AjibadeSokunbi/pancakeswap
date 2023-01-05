const Web3 = require('web3');

// abi of pancakeswap master chef contract
const contractabi = require("./pancake.json")

// contract address of pancakeswap master chef contract
const contractAddress = '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652';

// http provider configuration
const url = 'https://bold-black-energy.bsc.discover.quiknode.pro/c2bf115e5d95e1ee7a40bef1eb2e9bef41222bfb/';

const web3 = new Web3(new Web3.providers.HttpProvider(url));
const contract = new web3.eth.Contract(contractabi, contractAddress);

async function getUserActivity() {
    try {
      const address = '0x4E18817D575cf7DB588f526c363D8F6151931C5f';
  
      // Start from block 23
      let fromBlock = 23000000;
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
          type: event.event === 'Deposit' ? 'deposit' : 'withdrawal',
          pool: event.returnValues.pid,
          amount: event.returnValues.amount
        }));
        
  
    // Filter out the results with undefined amount
    const filteredActivity = activity.filter(item => item.amount !== undefined);

    // Get all the pool addresses
    const poolAddresses = new Set(filteredActivity.map(item => item.pool));

    console.log({
      pools: [...poolAddresses],
      activity: filteredActivity
    });
    } catch (error) {
      console.error(error);
    }
  }
  
  getUserActivity();
  