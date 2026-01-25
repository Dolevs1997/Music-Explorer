import Categories from "../../components/Categories/Categories";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import { useEffect, useState, useContext } from "react";
import Songs from "../../components/Songs/Songs";
import NavBar from "../../components/NavBar/NavBar";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import MapComponent from "../../components/Map/MapComponent";
import { SearchContext } from "../../Contexts/SearchContext";
import { useInactivity } from "../../hooks/useInactivity";
import propTypes from "prop-types";
export default function Home({ user }) {
  const {
    songSuggestions,
    setSongSuggestions,
    isRecording,
    setIsRecording,
    formVisible,
    setFormVisible,
    isVoiceSearch,
    setIsVoiceSearch,
  } = useContext(SearchContext);
  const location = useLocation();
  const { isMapVisible, setIsMapVisible } = useContext(SearchContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add inactivity detection
  useInactivity(30 * 60 * 1000, () => {
    // 30 minutes
    localStorage.removeItem("user");
    navigate("/login");
  });

  useEffect(() => {
    document.title = "Moodiify | Home";
  }, []);

  useEffect(() => {
    setIsLoading(true);

    if (!user) {
      setIsLoading(false);
      console.log("no user");
      setError("User not authenticated. Please log in.");
      navigate("/login");
      return;
    }
    setIsLoading(false);
  }, [navigate, user]);

  useEffect(() => {
    if (isMapVisible) {
      navigate("/global");
    }
  }, [isMapVisible, navigate, location.state, setIsMapVisible]);

  return (
    <div className="app-container">
      <header className="header">
        <Logo />
        {!isLoading && !error && (
          <Search
            setFormVisible={setFormVisible}
            formVisible={formVisible}
            isMapVisible={isMapVisible}
            setIsMapVisible={setIsMapVisible}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            userData={user}
            setSongSuggestions={setSongSuggestions}
            songSuggestions={songSuggestions}
            setIsVoiceSearch={setIsVoiceSearch}
            isVoiceSearch={isVoiceSearch}
          />
        )}
        <NavBar user={user} />
      </header>
      <main className="home">
        <div className="homeContainer">
          {!isLoading && !error && (
            <>
              {/* {formVisible && !isMapVisible && (
                <Form
                  setSongSuggestions={setSongSuggestions}
                  setFormVisible={setFormVisible}
                  formVisible={formVisible}
                />
              )} */}
              {songSuggestions.length == 0 && !isMapVisible && (
                <Categories formVisible={formVisible} user={user} />
              )}
              {songSuggestions.length > 0 &&
                !isVoiceSearch &&
                !isMapVisible &&
                !isRecording && <Songs songSuggestions={songSuggestions} />}

              {songSuggestions.length > 0 &&
                !isMapVisible &&
                !isRecording &&
                isVoiceSearch && <Songs songSuggestions={songSuggestions} />}

              {isMapVisible && <MapComponent />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

Home.propTypes = {
  user: propTypes.shape({
    email: propTypes.string.isRequired,
    token: propTypes.string.isRequired,
    playlists: propTypes.arrayOf(
      propTypes.shape({
        _id: propTypes.string,
        name: propTypes.string,
      }),
    ),
  }),
};
