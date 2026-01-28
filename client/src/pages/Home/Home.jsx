import Categories from "../../components/Categories/Categories";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import { useEffect, useContext } from "react";
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

  console.log("home rendering");
  // console.log("user at home: ", user);
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
    if (isMapVisible) {
      navigate("/global");
    }
  }, [isMapVisible, navigate, location.state, setIsMapVisible]);

  return (
    <div className="app-container">
      <header className="header">
        <Logo />

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

        <NavBar />
      </header>
      <main className="home">
        <div className="homeContainer">
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
