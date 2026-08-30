import { useParams, useLocation } from "react-router";
import { useEffect, useState } from "react";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import NavBar from "../../components/NavBar/NavBar";
import Song from "../../components/Song/Song";
import { Spinner } from "../../components/ui/spinner";

function getUniqueSongs(songs) {
  const seen = new Set();

  return songs.filter((song) => {
    const title = song?.song || song?.searchQuery || song?.title || song;
    const identity = song?.videoId || title?.trim().toLowerCase();

    if (!identity || seen.has(identity)) {
      console.log("song already exists in the playlist?: ", seen.has(identity));
      return false;
    }

    seen.add(identity);
    return true;
  });
}

function CategorySongsPlaylist() {
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
          `/api/categories/category/playlist-songs/?id=${playlistId}&country=${country}`,
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
        setPlaylist(getUniqueSongs(data));
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

      <div className="playlist-songs">
        <h2>{playlistName}</h2>
        {playlist.length > 0 ? (
          <div className="playlists">
            {playlist.map((song) => (
              <Song
                key={
                  song.videoId || song.song || song.searchQuery || song.title
                }
                song={
                  typeof song === "object"
                    ? {
                        ...song,
                        song: song.song || song.searchQuery || song.title,
                      }
                    : song
                }
                country={country}
                playingVideoId={playingVideoId}
                setPlayingVideoId={setPlayingVideoId}
                playlistId={playlistId}
              />
            ))}
          </div>
        ) : isLoading ? (
          <Spinner />
        ) : (
          <p>No playlist found</p>
        )}
      </div>
    </div>
  );
}

export default CategorySongsPlaylist;
