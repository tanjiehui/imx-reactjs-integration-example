import './App.css';
import { ethers } from 'ethers';
import { ImmutableXClient } from '@imtbl/imx-link-lib';
import { Link } from '@imtbl/imx-link-sdk';
import { ERC721TokenType, MintableERC721TokenType, ImmutableMethodResults, ETHTokenType, EthAddress, ImmutableOrderStatus } from '@imtbl/imx-link-types';
import { useEffect, useState } from 'react';
require('dotenv').config();

const App = () => {
  // initialise Immutable X Link SDK
  const link = new Link(process.env.REACT_APP_ROPSTEN_LINK_URL)
  
  // general
  const [wallet, setWallet] = useState('undefined');
  const [balance, setBalance] = useState<ImmutableMethodResults.ImmutableGetBalanceResult>(Object);
  const [client, setClient] = useState<ImmutableXClient>(Object);
  const [inventory, setInventory] = useState<ImmutableMethodResults.ImmutableGetAssetsResult>(Object);
  const [marketplace, setMarketplace] = useState<ImmutableMethodResults.ImmutableGetOrdersResult>(Object);

  // minting
  const [mintTokenId, setMintTokenId] = useState('');
  const [mintBlueprint, setMintBlueprint] = useState('');

  // buying and selling
  const [sellAmount, setSellAmount] = useState('');
  const [sellTokenId, setSellTokenId] = useState('');
  const [sellTokenAddress, setSellTokenAddress] = useState('');
  const [sellCancelOrder, setSellCancelOrder] = useState('');
  

  useEffect(() => {
    buildIMX()
  }, [])

  // initialise an Immutable X Client to interact with apis more easily
  async function buildIMX() {
    const publicApiUrl: string = process.env.REACT_APP_ROPSTEN_ENV_URL ?? '';
    setClient(await ImmutableXClient.build({publicApiUrl}))
  }

  // register and/or setup a user
  async function linkSetup(): Promise<void> {
    const res = await link.setup({})
    setWallet(res.address)
    setBalance(await client.getBalance({user: res.address, tokenAddress: 'eth'}))
    setInventory(await client.getAssets({user: res.address, sell_orders: true}))
    setMarketplace(await client.getOrders({status: ImmutableOrderStatus.active}))
  };

  // sell an asset
  async function sellNFT() {
    await link.sell({
      amount: sellAmount,
      tokenId: sellTokenId,
      tokenAddress: sellTokenAddress
    })
    setInventory(await client.getAssets({user: wallet, sell_orders: true}))
  };

  // cancel sell order
  async function cancelSell() {
    await link.cancel({
      orderId: sellCancelOrder
    })
    setInventory(await client.getAssets({user: wallet, sell_orders: true}))
  };

  // helper function to generate random ids
  function random()
    : number {
    const min = 1;
    const max = 1000000000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // the minting function should be on your backend
  async function mint() {
    // initialise a client with the minter for your NFT smart contract
    const provider = new ethers.providers.JsonRpcProvider(`https://eth-ropsten.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`);
    const minterPrivateKey: string = process.env.REACT_APP_MINTER_PK ?? ''; // registered minter for your contract
    const minter = new ethers.Wallet(minterPrivateKey).connect(provider);
    const publicApiUrl: string = process.env.REACT_APP_ROPSTEN_ENV_URL ?? '';
    const starkContractAddress: string = process.env.REACT_APP_ROPSTEN_STARK_CONTRACT_ADDRESS ?? '';
    const registrationContractAddress: string = process.env.REACT_APP_ROPSTEN_REGISTRATION_ADDRESS ?? '';
    const minterClient = await ImmutableXClient.build({
        publicApiUrl,
        signer: minter,
        starkContractAddress,
        registrationContractAddress,
    })

    // mint any number of NFTs to specified wallet address (must be registered on Immutable X first)
    const token_address: string = process.env.REACT_APP_TOKEN_ADDRESS ?? ''; // contract registered by Immutable
    const result = await minterClient.mint({
      mints: [{
          etherKey: wallet,
          tokens: [{
              type: MintableERC721TokenType.MINTABLE_ERC721,
              data: {
                  id: mintTokenId, // this is the ERC721 token id
                  blueprint: mintBlueprint, // this is passed to your smart contract at time of withdrawal from L2
                  tokenAddress: token_address.toLowerCase(),
              }
          }],
          nonce: random().toString(10),
          authSignature: ''
      }]
    });
    console.log(`Token minted: ${result.results[0].token_id}`);
    setInventory(await client.getAssets({user: wallet, sell_orders: true}))
  };

  return (
    <div className="App">
      <button onClick={linkSetup}>Setup</button>
      <div>
        Active wallet: {wallet}
      </div>
      <div>
        ETH balance: {JSON.stringify(balance)}
      </div>
      <br/><br/><br/>
      <div>
        Inventory:
        {JSON.stringify(inventory.result)}
      </div>
      <br/><br/><br/>
      <div>
        Mint NFT:
        <br/>
        <label>
          Token ID:
          <input type="text" value={mintTokenId} onChange={e => setMintTokenId(e.target.value)} />
        </label>
        <label>
          Blueprint:
          <input type="text" value={mintBlueprint} onChange={e => setMintBlueprint(e.target.value)} />
        </label>
        <button onClick={mint}>Mint</button>
      </div>
      <br/>
      <div>
        Sell asset (create sell order):
        <br/>
        <label>
          Amount (ETH):
          <input type="text" value={sellAmount} onChange={e => setSellAmount(e.target.value)} />
        </label>
        <label>
          Token ID:
          <input type="text" value={sellTokenId} onChange={e => setSellTokenId(e.target.value)} />
        </label>
        <label>
          Token Address:
          <input type="text" value={sellTokenAddress} onChange={e => setSellTokenAddress(e.target.value)} />
        </label>
        <button onClick={sellNFT}>Sell</button>
      </div>
      <br/>
      <div>
        Cancel sell order:
        <br/>
        <label>
          Order ID:
          <input type="text" value={sellCancelOrder} onChange={e => setSellCancelOrder(e.target.value)} />
        </label>
        <button onClick={cancelSell}>Cancel</button>
      </div>
      <br/><br/><br/>
      <div>
        Marketplace (active sell orders):
        <br/>
        {JSON.stringify(marketplace.result)}
      </div>
    </div>
  );
}

export default App;
