import './App.css';
import { Link, ImmutableXClient, ImmutableMethodResults, ProviderPreference} from '@imtbl/imx-sdk';
import { useEffect, useState } from 'react';
import Marketplace from './Marketplace';
import Inventory from './Inventory';
import Bridging from './Bridging';
import Buy from './Buy';
require('dotenv').config();

const App = () => {
  // initialise Immutable X Link SDK
  const link = new Link(process.env.REACT_APP_SANDBOX_LINK_URL)
  
  // general
  const [tab, setTab] = useState('marketplace');
  const [wallet, setWallet] = useState('undefined');
  const [balance, setBalance] = useState<ImmutableMethodResults.ImmutableGetBalanceResult>(Object);
  const [client, setClient] = useState<ImmutableXClient>(Object);


  useEffect(() => {
    buildIMX()
  }, [])

  // initialise an Immutable X Client to interact with apis more easily
  async function buildIMX() {
    const publicApiUrl: string = process.env.REACT_APP_SANDBOX_ENV_URL ?? '';
    setClient(await ImmutableXClient.build({publicApiUrl}))
  }

  // register and/or setup a user
  async function linkSetup(): Promise<void> {
    const res = await link.setup({ providerPreference: ProviderPreference.NONE })
    setWallet(res.address)
    setBalance(await client.getBalance({user: res.address, tokenAddress: 'eth'}))
  };

  function handleTabs() {
    if (client.address) {
      switch (tab) {
        case 'inventory':
          if (wallet === 'undefined') return <div>Connect wallet</div>
          return <Inventory
            client={client}
            link={link}
            wallet={wallet}
          />
        case 'bridging':
          //if (wallet === 'undefined') return <div>Connect wallet</div>
          return <Bridging
            client={client}
            link={link}
            wallet={wallet}
          />
        case 'buy':
          //if (wallet === 'undefined') return <div>Connect wallet</div>
          return <Buy
            client={client}
            link={link}
            wallet={wallet}
          />
        default:
          return <Marketplace
            client={client}
            link={link}
          />
      }
    }
    return null
  }

  return (
    <div className="App">
      <button onClick={linkSetup}>Setup</button>
      <div>
        Active wallet: {wallet}
      </div>
      <div>
        ETH balance (in wei): {balance?.balance?.toString()}
      </div>
      <button onClick={() => setTab('marketplace')}>Marketplace</button>
      <button onClick={() => setTab('inventory')}>Inventory</button>
      <button onClick={() => setTab('bridging')}>Deposit and withdrawal</button>
      <button onClick={() => setTab('buy')}>Buy</button>
      <br/><br/><br/>
      {handleTabs()}
    </div>
  );
}

export default App;
