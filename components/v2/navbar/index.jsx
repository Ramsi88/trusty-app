import styles from "../../../styles/Home.module.css";
import Link from "next/link";

const Navbar = () => {
    return ( 
        <>
            <div className={styles.nav}>
            <Link href="/" className={styles.link}>V1</Link>
            </div>
        </>
    );
}
 
export default Navbar;