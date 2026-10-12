import styles from "./SideBar.module.css";
import { History, House, Library } from "lucide-react";
import { NavLink } from "react-router";

function SideBar() {
  return (
    <nav className={styles.sideBar} aria-label="Main navigation">
      <NavLink
        to="/home"
        className={({ isActive }) =>
          `${styles.navItem}${isActive ? ` ${styles.active}` : ""}`
        }
      >
        <House size={22} strokeWidth={1.5} aria-hidden="true" />
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/myplaylists"
        className={({ isActive }) =>
          `${styles.navItem}${isActive ? ` ${styles.active}` : ""}`
        }
      >
        <Library size={22} strokeWidth={1.5} aria-hidden="true" />
        <span>Library</span>
      </NavLink>
      <div className={styles.navItem}>
        <History size={22} strokeWidth={1.5} aria-hidden="true" />
        <span>Recent Listening</span>
      </div>
    </nav>
  );
}

export default SideBar;
