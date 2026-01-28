import { useParams } from "react-router";
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

function SongsPlaylistUser() {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const { playlistId } = useParams();
  const location = useLocation();
  let playlist =
    location.state?.playlist ||
    user?.playlists?.find((p) => p.id === playlistId || p._id === playlistId);
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
  function handleRemoveSong(removedSong) {
    console.log("Removing song:", removedSong);
    setSongs((prevSongs) => prevSongs.filter((song) => song !== removedSong));
  }
  async function handleRemovePlaylist() {}
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
          <div className="playlist-songs">
            <div className={styles.playlistHeader}>
              <h1>{playlist.name} Playlist</h1>
              <NavDropdown title="" menuVariant="dark">
                <NavDropdown.Item>Edit Playlist</NavDropdown.Item>
                <NavDropdown.Item onClick={() => setShowModal(true)}>
                  Delete Playlist
                </NavDropdown.Item>
              </NavDropdown>
              {showModal && (
                <div className={styles.modalContent}>
                  <Modal.Dialog>
                    <Modal.Header
                      closeButton
                      onClick={() => setShowModal(false)}
                    >
                      <Modal.Title>Delete Playlist</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      Are you sure you want to delete the playlist{" "}
                      {playlist.name}?
                    </Modal.Body>
                    <Modal.Footer>
                      <Button onClick={() => setShowModal(false)} type="cancel">
                        Cancel
                      </Button>
                      <Button onClick={handleRemovePlaylist} type="delete">
                        Delete
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
