import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
//require("dotenv").config();

const apiKey = process.env.ETHERSCAN_API_KEY;
const apiUrl = "https://api.etherscan.io/api?module=account&action=balance&address=&tag=latest&apikey=";
const gasUrl = "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=";

export default function Api({account,balance,block , price, gas , usdBalance}) {
    const [dat,setDat] = useState();
    const urlLink = "url";

    let addr = "";

    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [blockX, setBlockX] = useState(null);
    const [priceX, setPriceX] = useState(null);

    if (isLoading) return <div><p>Loading...</p></div>;
    
    return (
        <div >
    
          {/* <Web3 block={block} price={price} /> */}
          {/* USD balance: <code>{JSON.stringify(usdBalance.result / 10**18)}</code><br/> */}
          USD balance: <code className={styles.col_dec}>$ {(balance*price.last_trade_price).toFixed(2)}</code><br/>
          {/* Block: <code>{JSON.stringify(block.height)}</code><br/> */}
          ETH Price: <code className={styles.col_val}>$ {JSON.stringify(price.last_trade_price)}</code><br/>
          Gas: <code className={styles.col_exe}>{JSON.stringify(Math.ceil(gas.result.suggestBaseFee))} gwei</code>
          <span>{data}</span>
    
        </div>
      );
}

/*
// Server Side Rendering - SSR
export async function getServerSideProps({ params }) {
    const req = await fetch(`http://localhost:3000/api/hello`);
    //const req = await fetch(`${server}/${params.id}.json`);
    const api = await req.json();
    console.log("data:",api)
    return {
        //props: { users: data },
        props: {api}
    };
}
*/ 


export async function getStaticProps() {
    //const resApi = await fetch(`${server}/api/articles`);
    //const articles = await resApi.json();
  
    const resBlock = await fetch("https://blockchain.info/latestblock");
    const block = await resBlock.json();
    const resPrice = await fetch("https://api.blockchain.com/v3/exchange/tickers/BTC-USD");
    const price = await resPrice.json();
  
    return {
      props: {
        // props for your component
        //articles,
        block,
        price,
      },
      // Next.js will attempt to re-generate the page:
      // - When a request comes in
      // - At most once every 10 seconds
      //revalidate: 60, // In seconds
    };
  }