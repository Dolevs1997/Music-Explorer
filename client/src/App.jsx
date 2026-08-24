import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import AppIntro from "./pages/AppIntro";
import CategoryPlaylists from "./pages/CategoryPlaylists/CategoryPlaylists";
import { useEffect, useState } from "react";
import { useContext } from "react";
import Register from "./pages/Register/Register";
import CategorySongsPlaylist from "./pages/CategorySongsPlaylist/CategorySongsPlaylist";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import SongsPlaylistUser from "./pages/SongsPlaylistUser/SongsPlaylistUser";
import "bootstrap/dist/css/bootstrap.min.css";
import Categories from "./components/Categories/Categories";
import Logo from "./components/Logo/Logo";
import NavBar from "./components/NavBar/NavBar";
import { SearchContext } from "./Contexts/SearchContext";
import Search from "./components/Search/Search";
import { UserProvider } from "./Contexts/UserContext";
import { CurrentLocationContext } from "./Contexts/CurrentLocationContext";
import PlaylistsUser from "./pages/PlaylistsUser/PlaylistsUser";
import Profile from "./pages/Profile/Profile";
import "@heroui/react/styles";
import UserContext from "./Contexts/UserContext";
import { Toaster, toast } from "react-hot-toast";
import propTypes from "prop-types";

function ProtectedRoute({ children }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.token) return undefined;

    toast.error("Please sign in to continue.");
    const redirectTimer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1500);

    return () => clearTimeout(redirectTimer);
  }, [user, navigate]);

  if (!user?.token) return null;

  return children;
}

ProtectedRoute.propTypes = {
  children: propTypes.node,
};

function App() {
  const [songSuggestions, setSongSuggestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const [currentLocation, setCurrentLocation] = useState(
    user?.country?.fullName || "United States",
  );
  useEffect(() => {
    document.title = "music-explorer | Home";
  }, []);

  return (
    <UserProvider>
      <Toaster />
      <CurrentLocationContext.Provider
        value={{ currentLocation, setCurrentLocation }}
      >
        <BrowserRouter>
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
              <Route path="/" element={<AppIntro />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home user={user} />
                  </ProtectedRoute>
                }
              >
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
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/category/playlists"
                element={
                  <ProtectedRoute>
                    <CategoryPlaylists />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/category/playlists/:playlistId/songs"
                element={
                  <ProtectedRoute>
                    <CategorySongsPlaylist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/myplaylists"
                element={
                  <ProtectedRoute>
                    <PlaylistsUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/myplaylists/:playlistId"
                element={
                  <ProtectedRoute>
                    <SongsPlaylistUser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/global"
                element={
                  <ProtectedRoute>
                    <Home user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/global/categories/:country"
                element={
                  <ProtectedRoute>
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
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </SearchContext.Provider>
        </BrowserRouter>
      </CurrentLocationContext.Provider>
    </UserProvider>
  );
}

export default App;
