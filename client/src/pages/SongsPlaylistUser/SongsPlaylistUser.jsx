import { useParams } from "react-router";
import { useEffect, useState } from "react";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import NavBar from "../../components/NavBar/NavBar";
import Songs from "../../components/Songs/Songs";
import styles from "./SongsPlaylistUser.module.css";
import { removeBtn } from "../../Contexts/RemoveContext.jsx";
import { useLocation } from "react-router";
import PropTypes from "prop-types";
SongsPlaylistUser.propTypes = {
  user: PropTypes.object,
  playlist: PropTypes.object,
};

function SongsPlaylistUser() {
  const { playlistId } = useParams();
  const location = useLocation();
  const user = location.state?.user || JSON.parse(localStorage.getItem("user"));
  let playlist =
    location.state?.playlist ||
    user?.playlists?.find((p) => p.id === playlistId);
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
          }
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
          })
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

  return (
    <div className={styles.container}>
      <removeBtn.Provider
        value={{ label: "Remove from Playlist", playlistId: playlistId }}
      >
        <section className="header">
          <Logo />
          <Search />
          <NavBar user={user} />
        </section>
        <h1>{playlist.name} Playlist</h1>
        {songs.length === 0 && <p>No songs in this playlist.</p>}
        {songs.length > 0 && (
          <Songs
            songSuggestions={songs}
            user={user}
            onRemoveSong={handleRemoveSong}
          />
        )}
      </removeBtn.Provider>
    </div>
  );
}

export default SongsPlaylistUser;
