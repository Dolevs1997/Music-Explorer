// /* eslint-disable react/prop-types */
import styles from "./NavBar.module.css";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import NavDropdown from "react-bootstrap/NavDropdown";
import { CurrentLocationContext } from "../../Contexts/CurrentLocationContext";

import { useContext } from "react";
import UserContext from "../../Contexts/UserContext";
function NavBar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const { currentLocation } = useContext(CurrentLocationContext);
  async function handleLogout() {
    try {
      const response = await axios.get(`/auth/logout`);
      if (response.status === 204) {
        setUser(null);
        navigate("/login", { replace: true });
        toast.success("Logout successful!", { duration: 2000 });
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Logout failed! Please try again.");
    }
  }

  return (
    <nav className={styles.navbar}>
      <NavDropdown
        title={<img src={user?.avatar || "/default-avatar-user.jpg"} />}
        menuVariant="dark"
        id="nav-dropdown-dark-example"
      >
        <NavDropdown.Item>
          <span className="countrySelector">{currentLocation}</span>
        </NavDropdown.Item>
        <NavDropdown.Item onClick={() => navigate("/profile")}>
          Profile
        </NavDropdown.Item>
        <NavDropdown.Item onClick={() => navigate("/myplaylists")}>
          Playlists
        </NavDropdown.Item>
        <NavDropdown.Divider />

        <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
      </NavDropdown>
    </nav>
  );
}

export default NavBar;
