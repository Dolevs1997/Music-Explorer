import styles from "./PlaylistMenu.module.css";
import { removeBtn } from "../../Contexts/RemoveContext";
import UserContext from "../../Contexts/UserContext";
import propTypes from "prop-types";
import { useContext, useState } from "react";
import { addSongToPlaylist, createPlaylist } from "../../utils/playlist";
import toast from "react-hot-toast";
import CreateModalPlaylist from "../CreateModalPlaylist/CreateModalPlaylist";

function PlaylistMenu({
  menuPlaylistsOpen,
  setMenuPlaylistsOpen,
  playlists,
  song,
}) {
  const { user, setUser } = useContext(UserContext);
  const [playlistName, setPlaylistName] = useState("");
  const [showModal, setShowModal] = useState(null);

  const remove = useContext(removeBtn);

  async function handleCreatePlaylist() {
    const trimmedPlaylistName = playlistName.trim();
    if (!trimmedPlaylistName) {
      toast.error("Enter a playlist name.");
      return;
    }

    try {
      if (!user?._id) {
        toast.error("Please sign in to create a playlist.");
        return;
      }

      const response = await createPlaylist(trimmedPlaylistName, user);
      const newPlaylist = response.data?.playlist;
      if (!newPlaylist) {
        throw new Error("The server did not return the created playlist.");
      }

      await handleAddSongToPlaylist(newPlaylist);
      setShowModal(null);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist. Please try again.");
    }
  }
  async function handleAddSongToPlaylist(playlist) {
    try {
      if (!user?._id) {
        toast.error("Please sign in to add songs to a playlist.");
        return;
      }

      const response = await addSongToPlaylist(song, user, playlist);
      const data = response.data;
      const addedSong = data?.playlist?.songs?.at(-1);

      if (!data?.playlist || !addedSong) {
        throw new Error("The server returned an invalid playlist response.");
      }

      const updatedUser = {
        ...user,
        playlists: playlists.map((existingPlaylist) =>
          existingPlaylist._id === playlist._id
            ? {
                ...existingPlaylist,
                songs: [...(existingPlaylist.songs || []), addedSong],
              }
            : existingPlaylist,
        ),
      };

      const playlistExists = playlists.some(
        (existingPlaylist) =>
          existingPlaylist._id === data.playlist._id ||
          existingPlaylist.name === data.playlist.name,
      );
      if (!playlistExists) {
        updatedUser.playlists = [...updatedUser.playlists, data.playlist];
      }

      setUser(updatedUser);
      setMenuPlaylistsOpen(false);
      toast.success(data.message || "Song added to playlist.");
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      toast.error("Failed to add song to playlist.");
    } finally {
      setPlaylistName("");
    }
  }

  return (
    <div
      className={`${styles.menuContainer} ${
        menuPlaylistsOpen ? styles.menuContainerOpen : ""
      }`}
    >
      {!remove && menuPlaylistsOpen && (
        <div className={styles.playlistMenu} role="menu">
          <div className={styles.menuHeader}>
            <div>
              <span className={styles.menuEyebrow}>YOUR LIBRARY</span>
              <h3 className={styles.menuTitle}>Save to playlist</h3>
            </div>
            <button
              type="button"
              className={styles.closeMenuButton}
              onClick={() => setMenuPlaylistsOpen(false)}
              aria-label="Close playlist menu"
            >
              ×
            </button>
          </div>
          <div className={styles.playlistList}>
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <button
                  type="button"
                  className={styles.playlistOption}
                  key={playlist._id || playlist.id || playlist.name}
                  role="menuitem"
                  onClick={() => handleAddSongToPlaylist(playlist)}
                >
                  <span className={styles.playlistArtwork} aria-hidden>
                    ♪
                  </span>
                  <span className={styles.playlistOptionName}>
                    {playlist.name}
                  </span>
                  <span className={styles.playlistOptionArrow} aria-hidden>
                    →
                  </span>
                </button>
              ))
            ) : (
              <p className={styles.emptyPlaylists}>
                Your playlists will show up here.
              </p>
            )}
          </div>
          <button
            type="button"
            className={styles.createPlaylistButton}
            onClick={() => {
              setMenuPlaylistsOpen(false);
              setShowModal("add-song");
            }}
          >
            <span className={styles.createPlaylistPlus} aria-hidden>
              +
            </span>
            Create new playlist
          </button>
        </div>
      )}
      {showModal === "add-song" && (
        <CreateModalPlaylist
          playlistName={playlistName}
          setPlaylistName={setPlaylistName}
          setShowModal={setShowModal}
          onClick={handleCreatePlaylist}
        />
      )}
    </div>
  );
}
PlaylistMenu.propTypes = {
  menuPlaylistsOpen: propTypes.bool,
  setMenuPlaylistsOpen: propTypes.func,
  playlists: propTypes.arrayOf(
    propTypes.shape({
      _id: propTypes.string,
      name: propTypes.string,
      user: propTypes.string,
      imageUrl: propTypes.string,
    }),
  ),
  song: propTypes.shape({
    id: propTypes.string,
    query: propTypes.string,
    title: propTypes.string,
    videoId: propTypes.string,
    artists: propTypes.string,
    album: propTypes.string,
    duration: propTypes.shape({
      minutes: propTypes.number,
      seconds: propTypes.number,
    }),
  }),
};
export default PlaylistMenu;
