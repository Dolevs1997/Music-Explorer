import styles from "./NavBar.module.css";
import { History, House, Library } from "lucide-react";
import { useContext } from "react";

import { NavLink } from "react-router";
import { CurrentLocationContext } from "../../Contexts/CurrentLocationContext";
function NavBar() {
  const { currentLocation } = useContext(CurrentLocationContext);
  return (
    <>
      <nav className={styles.navBar} aria-label="Main navigation">
        <span className={styles.country}>{currentLocation}</span>
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
        <NavLink
          to="/recentsongs"
          className={({ isActive }) =>
            `${styles.navItem}${isActive ? ` ${styles.active}` : ""}`
          }
        >
          <History size={22} strokeWidth={1.5} aria-hidden="true" />
          <span>Recent Listening</span>
        </NavLink>
      </nav>
    </>
  );
}

export default NavBar;
