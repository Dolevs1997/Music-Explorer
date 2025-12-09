/* eslint-disable react/prop-types */
import styles from "./NavBar.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import NavDropdown from "react-bootstrap/NavDropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useState } from "react";
function NavBar({ user }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  async function handleLogout() {
    try {
      const response = await axios.get(
        `http://${import.meta.env.VITE_SERVER_URL}/auth/logout`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.refreshToken}`,
          },
        }
      );
      if (response.status === 204) {
        localStorage.removeItem("user");
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
      <nav className={styles.nav}>
        <Toaster />
        <NavDropdown title="Menu" menuVariant="dark">
          <NavDropdown.Item>Profile</NavDropdown.Item>
          <DropdownButton drop="start" variant="dark" title="Playlists">
            {user?.playlists && user.playlists.length > 0 ? (
              user.playlists.map((playlist, index) => (
                <NavDropdown.Item
                  key={index}
                  onClick={() => {
                    console.log("playlist clicked:", playlist);
                    navigate(`/myplaylists/${playlist.id}`, {
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
            )}
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={() => setShowModal(true)}>
              Create Playlist
            </NavDropdown.Item>
          </DropdownButton>
          {/* <NavDropdown.Item>Playlists</NavDropdown.Item> */}
          {/* <NavDropdown.Item href="#action/3.3">Logout</NavDropdown.Item> */}
          <NavDropdown.Divider />
          <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
        </NavDropdown>
      </nav>
      <div
        className="modal show"
        style={{
          display: showModal ? "block" : "none",
          position: "fixed",
          width: "20%",
          height: "300px",
          top: "50%",
          left: "90%",
          transform: "translate(-50%, -50%)",
          opacity: 0.9,
        }}
      >
        <Modal.Dialog>
          <Modal.Header closeButton onHide={() => setShowModal(false)}>
            <Modal.Title>Enter Playlist Name</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <input type="text" placeholder="Enter playlist name" />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="dark" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button
              variant="dark"
              onClick={() => {
                setShowModal(false);
                toast.success("Playlist created successfully!");
              }}
            >
              Save changes
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>
    </div>
  );
}

export default NavBar;
