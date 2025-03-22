import styles from "../../../styles/Home.module.css";
import Link from "next/link";

export default function Wallet({network, account, balance, getNetworkState, block, gas}) {

    return (
        <>
            <div className={styles.description}>
                Wallet: <code><span className={styles.col_dec}><Link href={network.name?.toLowerCase()==="polygon"?`https://polygonscan.com/address/${account}`:`https://etherscan.io/address/${account}`} target={`_blank`}>{account}</Link></span></code> <br />
                Balance: <strong><span className={styles.col_val}>{balance}</span></strong> {network.name?.toLowerCase()==="polygon"?"MATIC":"ETH"} <br />

                {getNetworkState && (
                <>
                    Block: <code><span className={styles.col_data}>{block.current}</span></code> <br />
                    Gas: <code><span className={styles.col_data}>{gas.current}</span></code> <br />
                </>
                )}
            </div>
        </>
    )
}