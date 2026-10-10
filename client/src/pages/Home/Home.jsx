import Categories from "../../components/Categories/Categories";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import { useEffect, useContext } from "react";
import Songs from "../../components/Songs/Songs";
import DropDownComponent from "../../components/DropDownComponent/DropDownComponent";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import MapComponent from "../../components/Map/MapComponent";
import { SearchContext } from "../../Contexts/SearchContext";
import { useInactivity } from "../../hooks/useInactivity";
import axios from "axios";
import propTypes from "prop-types";
export default function Home() {
  const { songSuggestions, setSongSuggestions, isRecording, isVoiceSearch } =
    useContext(SearchContext);
  const location = useLocation();
  const { isMapVisible, setIsMapVisible } = useContext(SearchContext);
  const navigate = useNavigate();
  // Add inactivity detection
  useInactivity(30 * 60 * 1000, async () => {
    // 30 minutes
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Failed to log out on the backend", error);
    } finally {
      localStorage.removeItem("user");
      navigate("/login");
    }
  });

  useEffect(() => {
    if (isMapVisible) {
      navigate("/global");
    }
  }, [isMapVisible, navigate, location.state, setIsMapVisible]);

  return (
    <div className="app-container">
      <header className="header">
        <Logo />
        <DropDownComponent />
      </header>
      <main className="home">
        <h2>Discover Your Next Vibe</h2>
        <p>Tell us for you feel, explore new music around the globe</p>
        <Search setSongSuggestions={setSongSuggestions} />

        {songSuggestions.length == 0 && !isMapVisible && <Categories />}
        {songSuggestions.length > 0 &&
          !isVoiceSearch &&
          !isMapVisible &&
          !isRecording && <Songs songSuggestions={songSuggestions} />}

        {songSuggestions.length > 0 &&
          !isMapVisible &&
          !isRecording &&
          isVoiceSearch && <Songs songSuggestions={songSuggestions} />}

        {isMapVisible && <MapComponent />}
      </main>
    </div>
  );
}

Home.propTypes = {
  user: propTypes.shape({
    email: propTypes.string.isRequired,
    playlists: propTypes.arrayOf(
      propTypes.shape({
        _id: propTypes.string,
        name: propTypes.string,
      }),
    ),
    country: {
      shortName: propTypes.string,
      fullName: propTypes.string,
    },
  }),
};
