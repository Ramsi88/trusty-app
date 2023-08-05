// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  btc_block: any,
  btc_wallet: any,
  btc_price: any,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let addr = "";
  //let query = new API("asd");
  let block = await fetch(`https://blockchain.info/latestblock`);
  let wallet = await fetch(`https://blockchain.info/balance?active=${addr}`);
  let price = await fetch(`https://api.blockchain.com/v3/exchange/tickers/BTC-USD`);
  // let etherscan = await query.getApi(apiUrl+apiKey);
  // let gas = await query.getApi(gasUrl+apiKey);
  //console.log(block);
  let data : Data = {
      btc_block: block,
      btc_wallet: wallet,
      btc_price: price,
  //     eth_wallet: etherscan.result / 10**18,
  //     eth_gas: gas.result.suggestBaseFee
  };
  res.status(200).json({btc_block:block,btc_wallet:wallet,btc_price:price})
}
/*
class API {
    constructor(arg:string) {
      this.id = arg;
      this.url = "";
      this.json = {};
    }
  
    getApi = async (url="127.0.0.1") => {
      const resApi = await fetch(url);
      const json = await resApi.json();
      this.json = json;
      return json;    
    }
}
*/