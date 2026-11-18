import { useParams } from "react-router";
import { useEffect, useState, useContext } from "react";
import Logo from "../../components/Logo/Logo";
import DropDownComponent from "../../components/DropDownComponent/DropDownComponent";
import Songs from "../../components/Songs/Songs";
import { removeBtn } from "../../Contexts/RemoveContext.jsx";
import { useLocation } from "react-router";
import UserContext from "../../Contexts/UserContext";

import axios from "axios";
import SideBar from "../../components/SideBar/SideBar.jsx";

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
  useEffect(() => {
    async function fetchPlaylistSongs() {
      if (!playlistId) return;

      try {
        const response = await axios.get(`/api/playlist/?id=${playlistId}`);
        if (response.status !== 200) {
          setSongs([]);
          throw new Error("Failed to fetch playlist songs");
        }
        const data = await response.data;
        setSongs((data.songs || []).filter((songObj) => songObj?.song));
      } catch (error) {
        console.error("Error fetching playlist songs:", error);
      }
    }
    fetchPlaylistSongs();
  }, [playlistId]);
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

  return (
    <div className="app-container">
      <removeBtn.Provider
        value={{ label: "Remove from Playlist", playlistId: playlistId }}
      >
        <header className="header">
          <Logo />
          <DropDownComponent />
        </header>
        <SideBar />
        <main className="home">
          <h1>{playlist.name} Playlist</h1>
          {songs.length === 0 && <p>No songs in this playlist.</p>}
          <div className="playlists">
            <Songs songSuggestions={songs} onRemoveSong={handleRemoveSong} />
          </div>
        </main>
      </removeBtn.Provider>
    </div>
  );
}

export default SongsPlaylistUser;
