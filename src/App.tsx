import './App.css';
import { ethers } from 'ethers';
import { ImmutableXClient } from '@imtbl/imx-link-lib';
import { Link } from '@imtbl/imx-link-sdk';
import { ERC721TokenType, MintableERC721TokenType, ImmutableMethodResults, ETHTokenType, EthAddress } from '@imtbl/imx-link-types';
import { useEffect, useState } from 'react';
require('dotenv').config();

const App = () => {
  // initialise Immutable X Link SDK
  const link = new Link(process.env.ROPSTEN_LINK_URL)
  
  const [wallet, setWallet] = useState('undefined');
  const [inventory, setInventory] = useState<ImmutableMethodResults.ImmutableGetAssetsResult>(Object);
  const [lastMintedToken, setLastMintedToken] = useState('');
  const [client, setClient] = useState<ImmutableXClient>(Object);

  useEffect(() => {
    buildIMX()
  }, [])

  // initialise an Immutable X Client to interact with apis more easily
  async function buildIMX() {
    const publicApiUrl: string = process.env.ROPSTEN_ENV_URL ?? '';
    setClient(await ImmutableXClient.build({publicApiUrl}))
  }

  // register and/or setup a user
  async function linkSetup(): Promise<void> {
    const res = await link.setup({})
    setWallet(res.address)
    setInventory(await client.getAssets({user: res.address}))
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
    const provider = new ethers.providers.JsonRpcProvider(`https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`);
    const minterPrivateKey: string = process.env.MINTER_PK ?? ''; // registered minter for your contract
    const minter = new ethers.Wallet(minterPrivateKey).connect(provider);
    const publicApiUrl: string = process.env.ROPSTEN_ENV_URL ?? '';
    const starkContractAddress: string = process.env.ROPSTEN_STARK_CONTRACT_ADDRESS ?? '';
    const registrationContractAddress: string = process.env.ROPSTEN_REGISTRATION_ADDRESS ?? '';
    const minterClient = await ImmutableXClient.build({
        publicApiUrl,
        signer: minter,
        starkContractAddress,
        registrationContractAddress,
    })

    // mint any number of NFTs to specified wallet address (must be registered on Immutable X first)
    const token_address: string = process.env.TOKEN_ADDRESS ?? ''; // contract registered by Immutable
    const result = await minterClient.mint({
      mints: [{
          etherKey: wallet,
          tokens: [{
              type: MintableERC721TokenType.MINTABLE_ERC721,
              data: {
                  id: random().toString(10), // this is the ERC721 token id
                  blueprint: "100,100,10", // this is passed to your smart contract at time of withdrawal from L2
                  tokenAddress: token_address.toLowerCase(),
              }
          }],
          nonce: random().toString(10),
          authSignature: ''
      }]
    });
    console.log(`Token minted: ${result.results[0].token_id}`);
    setLastMintedToken(result.results[0].token_id)
  };

  return (
    <div className="App">
      <button onClick={linkSetup}>Setup</button>
      <button onClick={mint}>Mint</button>
      <div>
        Active wallet: {wallet}
      </div>
      <br/><br/><br/>
      <div>
        Last minted token id: {lastMintedToken}
      </div>
      <br/><br/><br/>
      <div>
        Inventory:
        {JSON.stringify(inventory.result)}
      </div>
    </div>
  );
}

export default App;
