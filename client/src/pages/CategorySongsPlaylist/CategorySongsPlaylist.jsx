import styles from "./CategorySongsPlaylist.module.css";
import { useParams, useLocation } from "react-router";
import { useEffect, useState } from "react";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import DropDownComponent from "../../components/DropDownComponent/DropDownComponent";
// import Song from "../../components/Song/Song";
import { Spinner } from "../../components/ui/spinner";
import axios from "axios";
import Songs from "../../components/Songs/Songs";
import SideBar from "../../components/SideBar/SideBar";
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
  const { playlistName, country } = location.state || {};
  // const [playlist, setPlaylist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  // const [playingVideoId, setPlayingVideoId] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `/api/categories/category/playlist-songs/?id=${playlistId}&country=${country}`,
        );
        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
        const data = await response.data;
        setIsLoading(false);
        setPlaylistSongs(getUniqueSongs(data));
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    if (playlistId && country) {
      fetchPlaylist();
    } else {
      console.warn("Missing required params:", { playlistId, country });
    }
  }, [playlistId, country, playlistSongs]);
  return (
    <div className="app-container">
      <header className="header">
        <Logo />
        <DropDownComponent />
      </header>
      <SideBar />
      <main className="home">
        <Search />
        <h2 className={styles.categorySongsPlaylistTitle}>{playlistName}</h2>
        {playlistSongs.length > 0 ? (
          <div className="playlists">
            <Songs songSuggestions={playlistSongs} />
          </div>
        ) : isLoading ? (
          <Spinner />
        ) : (
          <p>No playlist found</p>
        )}
      </main>
    </div>
  );
}

export default CategorySongsPlaylist;
