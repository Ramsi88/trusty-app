import styles from "../../../styles/Home.module.css";

export default function Connect({connectWallet}) {

    return (
        <>
            <button className={styles.button1 + " " + styles.col_data} onClick={()=>{connectWallet()}}>CONNECT</button>
        </>
    )
}