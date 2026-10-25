import styles from "./CategoryPlaylists.module.css";
import { useLocation } from "react-router";
import PlaylistCategory from "../../components/PlaylistCategory/PlaylistCategory";
import { useEffect, useState } from "react";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import DropDownComponent from "../../components/DropDownComponent/DropDownComponent";
import SideBar from "../../components/SideBar/SideBar";

function CategoryPlaylists() {
  const location = useLocation();
  const [playlistsCategory, setPlaylistsCategory] = useState([]);
  const [categoryName, setCategoryName] = useState("Category");

  useEffect(() => {
    document.title = "Music Explorer | Category Playlists";
  }, []);
  useEffect(() => {
    const { state } = location;
    if (state && state.playlistsCategory && state.categoryName) {
      setPlaylistsCategory(state.playlistsCategory);
      setCategoryName(state.categoryName);
    }
  }, [location]);

  return (
    <div>
      <header className="header">
        <Logo />
        <DropDownComponent />
      </header>
      <SideBar />
      <main className="home">
        <Search />

        <h1 className={styles.title}>{categoryName} Playlist</h1>

        <div className={styles.categoryPlaylists}>
          {playlistsCategory.length > 0 &&
            playlistsCategory.map((playlist) => (
              <PlaylistCategory
                playlist={playlist}
                key={playlist.id}
                shortName={location.state.country}
              />
            ))}
        </div>
      </main>
    </div>
  );
}

export default CategoryPlaylists;
