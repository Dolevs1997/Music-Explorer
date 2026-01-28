// import styles from "./PlaylistsUser.module.css";
import Logo from "../../components/Logo/Logo.jsx";
import Search from "../../components/Search/Search.jsx";
import NavBar from "../../components/NavBar/NavBar.jsx";
import { useNavigate } from "react-router";
import Button from "../../components/Button/Button.jsx";
function PlaylistsUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userPlaylists = user ? user.playlists : [];

  const navigate = useNavigate();
  console.log("user at PlaylistsUser: ", user);
  return (
    <div className="app-container">
      <header className="header">
        <Logo />
        <Search />
        <NavBar />
      </header>
      <main className="homeContainer">
        <div className="playlist-songs">
          <h1>Your Playlists</h1>
          {userPlaylists && userPlaylists.length > 0 ? (
            <ul>
              {userPlaylists.map((playlist) => (
                <li key={playlist._id || playlist.id}>
                  <Button
                    onClick={() =>
                      navigate(`/myplaylists/${playlist._id || playlist.id}`, {
                        state: { playlist, user },
                      })
                    }
                    type="link"
                  >
                    <span>{playlist.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No playlists available.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default PlaylistsUser;
