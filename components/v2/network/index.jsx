import styles from "../../../styles/Home.module.css";
import Link from "next/link";

export default function Network({getFactoryOwner, getProviderOrSigner, FACTORY_ADDRESS, switchNetwork, network, setIsOwner, setBalanceFactory, notifica}) {
    return (
        <>
            <h1 onClick={async () => {await getFactoryOwner(getProviderOrSigner, FACTORY_ADDRESS, setIsOwner, setBalanceFactory, notifica)}} className={styles.title}>
                <p className={styles.col_title}>
                  <Link href="/single">TRUSTY v2</Link>
                  <code onClick={()=>{switchNetwork()}} className={styles.col_dec}> {network.name} </code>
                </p>
            </h1>
        </>
    )
}
