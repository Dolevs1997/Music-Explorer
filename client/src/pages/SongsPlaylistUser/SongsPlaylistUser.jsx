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
  const [songs, setSongs] = useState(location.state?.songs || []);
  if (!playlist) {
    console.error("Playlist not found for ID:", playlistId);
  }
  if (!user) {
    console.error("User not found in local storage or state.");
  }
  async function fetchPlaylistSongs() {
    if (!user?.token || !playlistId) return;

    try {
      const response = await fetch(
        `http://${
          import.meta.env.VITE_SERVER_URL
        }/music-explorer/playlist/?id=${playlistId}`,
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
      setSongs(
        (data.songs || []).map((songObj) => songObj.song).filter(Boolean),
      );
    } catch (error) {
      console.error("Error fetching playlist songs:", error);
    }
  }

  function handleRemoveSong(removedSong, videoId) {
    setSongs((prevSongs) =>
      prevSongs.filter((songItem) => {
        const itemValue =
          typeof songItem === "object" && songItem !== null
            ? songItem.song || songItem.title || songItem.name || songItem._id
            : songItem;
        const removedValue =
          typeof removedSong === "object" && removedSong !== null
            ? removedSong.song ||
              removedSong.title ||
              removedSong.name ||
              removedSong._id
            : removedSong;
        const itemVideoId =
          typeof songItem === "object" && songItem !== null
            ? songItem.videoId || songItem._id || songItem.id
            : null;

        return itemVideoId !== videoId && itemValue !== removedValue;
      }),
    );

    const updatedUser = {
      ...user,
      playlists: user.playlists.map((p) =>
        p._id === playlistId || p.id === playlistId
          ? {
              ...p,
              songs: (p.songs || []).filter((s) => {
                const songTitle = s?.song || s?.title || s?.name;
                const songVideoId = s?.videoId || s?._id || s?.id;
                return songVideoId !== videoId && songTitle !== removedSong;
              }),
            }
          : p,
      ),
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  useEffect(() => {
    fetchPlaylistSongs();
  }, [playlistId, user?.token]);

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
