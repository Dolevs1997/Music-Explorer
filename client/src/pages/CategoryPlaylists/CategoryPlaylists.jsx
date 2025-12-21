import styles from "./CategoryPlaylists.module.css";
import { useLocation } from "react-router";
import PlaylistCategory from "../../components/PlaylistCategory/PlaylistCategory";
import { useNavigate } from "react-router";
import { useEffect, useState, useContext } from "react";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import NavBar from "../../components/NavBar/NavBar";

import { SearchContext } from "../../Contexts/SearchContext";
function CategoryPlaylists() {
  const navigate = useNavigate();
  const location = useLocation();
  const [playlistsCategory, setPlaylistsCategory] = useState([]);
  const [categoryName, setCategoryName] = useState("Category");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  const searchContext = useContext(SearchContext);

  useEffect(() => {
    document.title = "Moodiify | Category Playlists";
  }, []);
  useEffect(() => {
    const { state } = location;
    if (state && state.playlistsCategory && state.categoryName && state.token) {
      setPlaylistsCategory(state.playlistsCategory);
      setCategoryName(state.categoryName);
    }
  }, [location, navigate]);

  return (
    <>
      <div className={styles.header}>
        <Logo />
        <Search
          setFormVisible={searchContext.setFormVisible}
          formVisible={searchContext.formVisible}
          isMapVisible={searchContext.isMapVisible}
          setIsMapVisible={searchContext.setIsMapVisible}
          isRecording={searchContext.isRecording}
          setIsRecording={searchContext.setIsRecording}
          userData={user}
          setSongSuggestions={searchContext.setSongSuggestions}
          setIsVoiceSearch={searchContext.setIsVoiceSearch}
        />
        <NavBar user={user} />
      </div>
      <div className={styles.playlistsContainer}>
        <h1 className={styles.title}>{categoryName} Playlist</h1>

        <div className={styles.playlists}>
          {playlistsCategory.length > 0 &&
            playlistsCategory.map((playlist) => (
              <PlaylistCategory
                playlist={playlist}
                key={playlist.id}
                token={location.state.token}
                shortName={location.state.country}
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default CategoryPlaylists;
