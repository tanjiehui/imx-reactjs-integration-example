import { ImmutableXClient } from '@imtbl/imx-link-lib';
import { useEffect } from 'react';
require('dotenv').config();

interface BridgingProps {
  client: ImmutableXClient
}

const Bridging = ({client}: BridgingProps) => {
//   const [Bridging, setBridging] = useState<ImmutableMethodResults.ImmutableGetOrdersResult>(Object);

  useEffect(() => {
    load()
  }, [])

  async function load(): Promise<void> {
    // setBridging(await client.getOrders({status: ImmutableOrderStatus.active}))
  };

  return (
    <div>
      <div>
        Bridging:
        <br/>

      </div>
    </div>
  );
}

export default Bridging;
