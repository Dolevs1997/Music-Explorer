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
import { useEffect, useState, useMemo, useContext } from "react";
import Register from "./pages/Register/Register";
import CategorySongsPlaylist from "./pages/CategorySongsPlaylist/CategorySongsPlaylist";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import SongsPlaylistUser from "./pages/SongsPlaylistUser/SongsPlaylistUser";
import "bootstrap/dist/css/bootstrap.min.css";
import Categories from "./components/Categories/Categories";
import Logo from "./components/Logo/Logo";
import DropDownComponent from "./components/DropDownComponent/DropDownComponent";
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
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PlayerBar from "./components/PlayerBar/PlayerBar";
function ProtectedRoute({ children }) {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (user?._id) return undefined;

    toast.error("Please sign in to continue.");
    const redirectTimer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1500);

    return () => clearTimeout(redirectTimer);
  }, [user, navigate]);

  if (!user?._id) return null;

  return children;
}

ProtectedRoute.propTypes = {
  children: propTypes.node,
};
const queryClient = new QueryClient();

function App() {
  const [songSuggestions, setSongSuggestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [initialUser, setInitialUser] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [currentLocation, setCurrentLocation] = useState(
    () => user?.country?.fullName || "United States",
  );
  useEffect(() => {
    document.title = "music-explorer | Home";
  }, []);
  useEffect(() => {
    const silentLogin = async () => {
      try {
        // Ping the server. The browser automatically sends the httpOnly cookie!
        const response = await axios.get("/auth/refresh");
        // If successful, save the user data
        setInitialUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (e) {
        console.error("Silent login failed: ", e.response?.status);
        localStorage.removeItem("user");
      }
    };

    silentLogin();
  }, []);

  // 2. Memoize the massive Search Context Value
  const searchContextValue = useMemo(
    () => ({
      songSuggestions,
      setSongSuggestions,
      isRecording,
      setIsRecording,
      isMapVisible,
      setIsMapVisible,
      isVoiceSearch,
      setIsVoiceSearch,
    }),
    [songSuggestions, isRecording, isMapVisible, isVoiceSearch],
  );
  // if (isCheckingAuth) {
  //   // Shows a black screen for a split second so the ProtectedRoute doesn't kick them out too early
  //   return <div style={{ height: "100vh", backgroundColor: "#000" }} />;
  // }
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <CurrentLocationContext.Provider
          value={{ currentLocation, setCurrentLocation }}
        >
          <BrowserRouter>
            <SearchContext.Provider value={searchContextValue}>
              <Routes>
                <Route path="/" element={<AppIntro />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <Home user={initialUser} />
                    </ProtectedRoute>
                  }
                >
                  <Route path="categories" element={<Categories />} />
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
                      <Home user={initialUser} />
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
                          <DropDownComponent />
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
            <PlayerBar />
          </BrowserRouter>
        </CurrentLocationContext.Provider>
      </QueryClientProvider>
    </UserProvider>
  );
}

export default App;
