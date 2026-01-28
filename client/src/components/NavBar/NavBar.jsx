// /* eslint-disable react/prop-types */
import styles from "./NavBar.module.css";
import { useNavigate } from "react-router";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import NavDropdown from "react-bootstrap/NavDropdown";

import { useContext } from "react";
import UserContext from "../../Contexts/UserContext";
function NavBar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  // console.log("user: ", user);

  async function handleLogout() {
    try {
      const response = await axios.get(
        `http://${import.meta.env.VITE_SERVER_URL}/auth/logout`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.refreshToken}`,
          },
        },
      );
      if (response.status === 204) {
        setUser(null);
        toast.success("Logout successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Logout failed! Please try again.");
    }
  }

  return (
    <div>
      <nav className={styles.navbar}>
        <Toaster />
        <NavDropdown title="Menu" menuVariant="dark">
          <NavDropdown.Item>Profile</NavDropdown.Item>
          <NavDropdown.Item onClick={() => navigate("/myplaylists")}>
            Playlists
          </NavDropdown.Item>
          <NavDropdown.Divider />

          {/* {user?.playlists && user.playlists.length > 0 ? (
              user.playlists.map((playlist, index) => (
                <NavDropdown.Item
                  key={index}
                  onClick={() => {
                    console.log("playlist clicked:", playlist);
                    navigate(`/myplaylists/${playlist._id || playlist.id}`, {
                      state: { playlist, user },
                    });
                  }}
                >
                  {playlist.name}
                </NavDropdown.Item>
              ))
            ) : (
              <NavDropdown.Item disabled>
                No Playlists Available
              </NavDropdown.Item>
            )} */}

          <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
        </NavDropdown>
      </nav>
    </div>
  );
}

export default NavBar;
