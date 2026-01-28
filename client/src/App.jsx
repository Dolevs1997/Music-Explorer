import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import CategoryPlaylists from "./pages/CategoryPlaylists/CategoryPlaylists";
import { useEffect, useState } from "react";
import Register from "./pages/Register/Register";
import SongsPlaylist from "./pages/SongsPlaylist/SongsPlaylist";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import SongsPlaylistUser from "./pages/SongsPlaylistUser/SongsPlaylistUser";
import "bootstrap/dist/css/bootstrap.min.css";
import Categories from "./components/Categories/Categories";
import Logo from "./components/Logo/Logo";
import NavBar from "./components/NavBar/NavBar";
import { SearchContext } from "./Contexts/SearchContext";
import Search from "./components/Search/Search";
import { UserProvider } from "./Contexts/UserContext";

function App() {
  const [songSuggestions, setSongSuggestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  // console.log("user at App: ", user);

  useEffect(() => {
    document.title = "Moodiify | Home";
  }, []);

  return (
    <UserProvider>
      <BrowserRouter basename="/moodiify">
        <SearchContext.Provider
          value={{
            songSuggestions,
            setSongSuggestions,
            isRecording,
            setIsRecording,
            isMapVisible,
            setIsMapVisible,
            formVisible,
            setFormVisible,
            isVoiceSearch,
            setIsVoiceSearch,
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            {/* <Route index element={<Home user={user} />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/home" element={<Home user={user} />}>
              <Route
                path="categories"
                element={<Categories formVisible={formVisible} user={user} />}
              />
              <Route
                path="songSuggestions"
                element={<Navigate to="/home" replace />}
              />
            </Route>

            <Route
              path="/category/playlists"
              element={<CategoryPlaylists />}
            ></Route>
            <Route
              path="/category/playlists/:playlistId/songs"
              element={<SongsPlaylist />}
            />

            <Route
              path="/myplaylists/:playlistId"
              element={<SongsPlaylistUser />}
            />
            <Route path="/global" element={<Home user={user} />} />
            <Route
              path="/global/categories/:country"
              element={
                <div className="home">
                  <div className="header">
                    <Logo />
                    <Search />
                    <NavBar />
                  </div>
                  <div className="homeContainer">
                    <Categories />
                  </div>
                </div>
              }
            />

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </SearchContext.Provider>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
