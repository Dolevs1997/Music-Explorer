import { useParams, useLocation } from "react-router";
import { useEffect, useState } from "react";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import NavBar from "../../components/NavBar/NavBar";
import Song from "../../components/Song/Song";
import { Spinner } from "../../components/ui/spinner";
function SongsPlaylist() {
  const { playlistId } = useParams();
  const location = useLocation();
  const { playlistName, token, country } = location.state || {};
  const [playlist, setPlaylist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [playingVideoId, setPlayingVideoId] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://${
            import.meta.env.VITE_SERVER_URL
          }/music-explorer/categories/category/playlist-songs/?id=${playlistId}&country=${country}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setIsLoading(false);
        console.log("data: ", data);
        setPlaylist(data);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    if (playlistId && token && country) {
      fetchPlaylist();
    } else {
      console.warn("Missing required params:", { playlistId, token, country });
    }
  }, [playlistId, token, country]);
  return (
    <div className="app-container">
      <header className="header">
        <Logo />
        <Search />
        <NavBar />
      </header>
      <main className="homeContainer">
        <div className="playlist-songs">
          <h2>{playlistName}</h2>
          {playlist.length > 0 ? (
            <ul>
              {playlist.map((song, index) => (
                <Song
                  key={index}
                  song={song.searchQuery || song.title}
                  country={location.state.country}
                  playingVideoId={playingVideoId}
                  setPlayingVideoId={setPlayingVideoId}
                  playlistId={playlistId}
                />
              ))}
            </ul>
          ) : isLoading ? (
            <Spinner />
          ) : (
            <p>No playlist found</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default SongsPlaylist;
