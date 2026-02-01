import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useContext } from "react";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import NavBar from "../../components/NavBar/NavBar";
import Songs from "../../components/Songs/Songs";
import { removeBtn } from "../../Contexts/RemoveContext.jsx";
import { useLocation } from "react-router";
import UserContext from "../../Contexts/UserContext";
import NavDropdown from "react-bootstrap/NavDropdown";
import styles from "./SongsPlaylistUser.module.css";
import Modal from "react-bootstrap/Modal";
import Button from "../../components/Button/Button.jsx";
import toast, { Toaster } from "react-hot-toast";
import { removePlaylist, addSongToPlaylist } from "../../utils/playlist.js";

function SongsPlaylistUser() {
  const { user, setUser } = useContext(UserContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState("");

  const { playlistId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  let playlist =
    location.state?.playlist ||
    user?.playlists?.find((p) => p.id === playlistId || p._id === playlistId);
  console.log(user.playlists);
  const [songs, setSongs] = useState(location.state?.songs || []);
  console.log("SongsPlaylistUser render");
  if (!playlist) {
    console.error("Playlist not found for ID:", playlistId);
  }
  if (!user) {
    console.error("User not found in local storage or state.");
  }
  // console.log("playlist", playlist);
  useEffect(() => {
    async function fetchPlaylistSongs() {
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_SERVER_URL
          }/moodiify/playlist/?id=${playlistId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          },
        );
        if (!response.ok) {
          setSongs([]);
          throw new Error("Failed to fetch playlist songs");
        }
        const data = await response.json();
        // console.log("Fetched playlist songs data:", data);
        setSongs(
          data.songs.map((songObj) => {
            // console.log("songObj: ", songObj);
            return songObj.song;
          }),
        );

        // setSongs(() => data.map((song) => song.song));
        // setSongs(data.playlist.songs.song || []);
        // console.log("songs", songs);
      } catch (error) {
        console.error("Error fetching playlist songs:", error);
      }
    }
    fetchPlaylistSongs();
  }, [playlistId, user.token, songs.length]);
  async function handleAddPlaylist() {
    setShowCreateModal(false);
    const result = await addSongToPlaylist("", "", playlistName, user);
    console.log("user playlists: ", user.playlists);
    if (result.status == 200) {
      const updatedUser = {
        ...user,
        playlists: [...user.playlists, result.data.playlist],
      };
      setUser(updatedUser);
      console.log("user playlists: ", user.playlists);

      toast.success(`${result.data.message}`);
    } else toast.error(`${result.data.message}`);
  }
  function handleRemoveSong(removedSong) {
    console.log("Removing song:", removedSong);
    setSongs((prevSongs) => prevSongs.filter((song) => song !== removedSong));
  }
  async function handleRemovePlaylist() {
    try {
      const data = await removePlaylist(playlistId, user);

      console.log("Delete playlist response data:", data);
      const updatedPlaylists = user.playlists.filter(
        (p) => p.id !== playlistId && p._id !== playlistId,
      );
      const updatedUser = { ...user, playlists: updatedPlaylists };
      setUser(updatedUser);
      toast.success("Playlist deleted successfully");
      setShowDeleteModal(false);
      navigate("/home");
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Failed to delete playlist");
    }
  }
  return (
    <div className="app-container">
      <removeBtn.Provider
        value={{ label: "Remove from Playlist", playlistId: playlistId }}
      >
        <header className="header">
          <Logo />
          <Search />
          <NavBar />
        </header>

        <main className="homeContainer">
          <Toaster />
          <div className="playlist-songs">
            <div className={styles.playlistHeader}>
              <h1>{playlist.name} Playlist</h1>
              <NavDropdown title="" menuVariant="dark">
                <NavDropdown.Item>Edit Playlist</NavDropdown.Item>
                <NavDropdown.Item onClick={() => setShowDeleteModal(true)}>
                  Delete Playlist
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => setShowCreateModal(true)}>
                  Create Playlist
                </NavDropdown.Item>
              </NavDropdown>
              {showDeleteModal && (
                <div className={styles.modalContent}>
                  <Modal.Dialog>
                    <Modal.Header
                      closeButton
                      onClick={() => setShowDeleteModal(false)}
                    >
                      <Modal.Title>Delete Playlist</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      Are you sure you want to delete the playlist{" "}
                      {playlist.name}?
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        onClick={() => setShowDeleteModal(false)}
                        type="cancel"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleRemovePlaylist} type="delete">
                        Delete
                      </Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </div>
              )}
              {showCreateModal && (
                <div
                  className="modal show"
                  style={{
                    display: showCreateModal ? "block" : "none",
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
                    <Modal.Header
                      closeButton
                      onHide={() => setShowCreateModal(false)}
                    >
                      <Modal.Title>Enter Playlist Name</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                      <input
                        type="text"
                        placeholder="Enter playlist name"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                      />
                    </Modal.Body>

                    <Modal.Footer>
                      <Button
                        variant="dark"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Close
                      </Button>
                      <Button variant="dark" onClick={handleAddPlaylist}>
                        Save changes
                      </Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </div>
              )}
            </div>
            {songs.length === 0 && <p>No songs in this playlist.</p>}
            {songs.length > 0 && (
              <Songs
                songSuggestions={songs}
                user={user}
                onRemoveSong={handleRemoveSong}
              />
            )}
          </div>
        </main>
      </removeBtn.Provider>
    </div>
  );
}

export default SongsPlaylistUser;
