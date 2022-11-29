import { Link, ImmutableXClient } from '@imtbl/imx-sdk';
import { useState } from 'react';
require('dotenv').config();

interface BuyProps {
  client: ImmutableXClient,
  link: Link
  wallet: string
}

const Buy = ({client, link, wallet}: BuyProps) => {
  const [buyResult, setBuyResult] = useState('');
  const [orderId, setOrderId] = useState('');

  // transfer token
  async function buy() {
    try{
        let result = await link.buy({ orderIds: [""]})

        console.log(result)
        const strResult = JSON.stringify(result)
        setBuyResult(strResult);
    }catch(error){
        console.log(error)
    }
  }

  return (
    <div>
      <div>
        <label>
        Buy order id:
          <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)} />
        </label>
        <button onClick={buy}>Buy</button>
        <br/>
      </div>
      <br/><br/><br/>
      <div>
        Buy result:
        <br/>
        {buyResult}
        {}
      </div>
      
    </div>
    
  );
}
export default Buy;
