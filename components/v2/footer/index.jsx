import styles from "../../../styles/Home.module.css";
import Image from "next/image";
import Link from "next/link";

const Footer = ({network, FACTORY_ADDRESS}) => {
    return (
        <>
            <div className={styles.logo}>
                <Image className={styles.image} src="/logo.png" width={350} height={350} alt="img" priority/>
                
                <span>Trusty Factory Address: </span><br/>
                <code className={styles.col_data}>
                <Link target="_blank" href={
                    network.name?.toLowerCase()==='mainnet' ? 
                    `https://etherscan.io/address/${FACTORY_ADDRESS}` : 
                    network.name?.toLowerCase()==='polygon' ? 
                    `https://polygonscan.com/address/${FACTORY_ADDRESS}` : 
                    network.name?.toLowerCase()==='sepolia' ? 
                    `https://sepolia.etherscan.io/address/${FACTORY_ADDRESS}` :
                    ""
                }>{
                    network.name?.toLowerCase()==='mainnet' ?
                    `https://etherscan.io/address/${FACTORY_ADDRESS}` :
                    network.name?.toLowerCase()==='polygon' ?
                    `https://polygonscan.com/address/${FACTORY_ADDRESS}` :
                    network.name?.toLowerCase()==='sepolia' ? 
                    `https://sepolia.etherscan.io/address/${FACTORY_ADDRESS}` :
                    ""
                }</Link>
                </code>
            </div>

            <footer className={styles.footer}>
                <code>
                Copyright &copy; {new Date().getFullYear()} Ramzi Bougammoura <br/>
                Made with &#10084; by <Link href="https://x.com/0xrms_" target="_blank"> 0xrms </Link>
                </code>
            </footer>
        </>
    );
}
 
export default Footer;