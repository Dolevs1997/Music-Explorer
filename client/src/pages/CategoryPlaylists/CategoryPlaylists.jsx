import styles from "./CategoryPlaylists.module.css";
import { useLocation } from "react-router";
import PlaylistCategory from "../../components/PlaylistCategory/PlaylistCategory";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import NavBar from "../../components/NavBar/NavBar";
// import UserContext from "../../Contexts/UserContext";
// import { getStoredUser } from "../../global/StoredUser";
// import { SearchContext } from "../../Contexts/SearchContext";
function CategoryPlaylists() {
  const navigate = useNavigate();
  const location = useLocation();
  const [playlistsCategory, setPlaylistsCategory] = useState([]);
  const [categoryName, setCategoryName] = useState("Category");
  // const user = getStoredUser();
  // const searchContext = useContext(SearchContext);
  console.log("Category Playlists Page");
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
    <div>
      <header className={styles.header}>
        <Logo />
        <Search />
        <NavBar />
      </header>
      <main className={styles.playlistsContainer}>
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
      </main>
    </div>
  );
}

export default CategoryPlaylists;
