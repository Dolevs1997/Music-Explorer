import { useParams } from "react-router";
import { useEffect, useState, useContext } from "react";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import NavBar from "../../components/NavBar/NavBar";
import Songs from "../../components/Songs/Songs";
import { removeBtn } from "../../Contexts/RemoveContext.jsx";
import { useLocation } from "react-router";
import UserContext from "../../Contexts/UserContext";
import styles from "./SongsPlaylistUser.module.css";

import { Toaster } from "react-hot-toast";

function SongsPlaylistUser() {
  const { user, setUser } = useContext(UserContext);

  const { playlistId } = useParams();
  const location = useLocation();
  let playlist = location.state?.playlist;
  console.log(user.playlists);
  const [songs, setSongs] = useState(location.state?.songs || []);
  if (!playlist) {
    console.error("Playlist not found for ID:", playlistId);
  }
  if (!user) {
    console.error("User not found in local storage or state.");
  }
  // console.log("playlist", playlist);
  function handleRemoveSong(removedSong, videoId) {
    console.log("removedSong: ", removedSong);
    console.log("videoId: ", videoId);
    // Update local songs state
    setSongs((prevSongs) =>
      prevSongs.filter(
        (song) => song !== removedSong && song.videoId !== videoId,
      ),
    );
    const updatedUser = {
      ...user,
      playlists: user.playlists.map((p) =>
        p._id === playlistId || p.id === playlistId
          ? {
              ...p,
              songs: (p.songs || []).filter(
                (s) => s.videoId !== videoId && s.song !== removedSong,
              ),
            }
          : p,
      ),
    };

    setUser(updatedUser);
  }
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
  }, [playlistId, user.token]);

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
