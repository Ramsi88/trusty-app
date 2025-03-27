import styles from "../../../styles/Home.module.css";
import Link from "next/link";

const Navbar = () => {
    return ( 
        <>
            <div className={styles.nav}>
                <Link href="/" className={styles.link}>V1</Link>
                <Link href="/v2" className={styles.link}>Factory</Link>
                <Link href="/v2/advanced" className={styles.link}>Factory Advanced</Link>
            </div>
        </>
    );
}
 
export default Navbar;