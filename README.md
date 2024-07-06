# web3app
dabl play

## Use this app

### Prerequisites

NodeJS and packages (todo: complete this list)
> - npm install axios cheerio
> - wagmi, viem, what else?

### Step 1 Clone the repo

Main branch of: git@github.com:m4sterbunny/web3app.git

### Step 2 Serve app

To serve app on local host

1. From root directory, run `npm init`
2. Run `npm install` to install the dependencies specified in the package.json file
3. Run `npm run dev`

### Step 3 Connect to chain

Connect to the Polygon ZK Cardano chain with your wallet
> e.g. Chainlist with MetaMask: https://chainlist.org/chain/2442

### Step 4 Connect wallet and use app

Navigate to localhost:3000
> or see output of `npm run dev` to view serve location

## Background info

This app is per the Dabl club voyage to the point that it supports:

### Bootcamp tokens claim
If connected wallet has not claimed 25 bootcamp tokens from this contract:
https://cardona-zkevm.polygonscan.com/tx/0x0de65814e8a18a0d83493b43f37a17b9cf19e11aef2cb00c64d343d8e3353c0b
it can do so.

### Send Eth

The app supports sending Eth on chain/2442
The app supports sending ERC20 on chain/2442