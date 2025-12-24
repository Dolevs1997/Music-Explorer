// import styles from "./SongsPlaylist.module.css";
import { useParams, useLocation } from "react-router";
import { useEffect, useState } from "react";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import NavBar from "../../components/NavBar/NavBar";
import Song from "../../components/Song/Song";
// import { useNavigate } from "react-router-dom";
function SongsPlaylist() {
  const { playlistId } = useParams();
  const location = useLocation();
  const { playlistName } = location.state || {};
  const [playlist, setPlaylist] = useState([]);
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [playbackPositions, setPlaybackPositions] = useState({});

  // console.log("playlist", playlist);
  // console.log("SearchContext in SongsPlaylist:", searchContext);
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(
          `http://${
            import.meta.env.VITE_SERVER_URL
          }/moodiify/videoSong/playlist/?id=${playlistId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPlaylist(data);
        // console.log("Fetched playlist data:", data);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    fetchPlaylist();
  }, [playlistId, user]);
  return (
    <div className="app-container">
      <header className="header">
        <Logo />
        <Search />
        <NavBar user={user} />
      </header>
      <main className="homeContainer">
        <div className="playlist-songs">
          <h2>{playlistName}</h2>
          {playlist.length > 0 ? (
            <ul className="songsContainer">
              {playlist.map((song, index) => (
                <Song
                  key={index}
                  song={song.title}
                  user={user}
                  country={location.state.country}
                  playingVideoId={playingVideoId}
                  setPlayingVideoId={setPlayingVideoId}
                  playlistId={playlistId}
                  playbackPositions={playbackPositions}
                  setPlaybackPositions={setPlaybackPositions}
                />
              ))}
            </ul>
          ) : (
            <p>No songs found in this playlist.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default SongsPlaylist;
