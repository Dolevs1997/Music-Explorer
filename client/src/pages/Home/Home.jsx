import Categories from "../../components/Categories/Categories";
import Logo from "../../components/Logo/Logo";
import Search from "../../components/Search/Search";
import { useEffect, useState, useContext } from "react";
import Form from "../../components/Form/Form";
import Songs from "../../components/Songs/Songs";
import NavBar from "../../components/NavBar/NavBar";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import MapComponent from "../../components/Map/MapComponent";
import { SearchContext } from "../../Contexts/SearchContext";
export default function Home() {
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
  console.log("location at home:", location);
  const { isMapVisible, setIsMapVisible } = useContext(SearchContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("isMapVisible at home:", isMapVisible);
  // console.log("songSuggestions at home:", songSuggestions);
  // console.log("location at home:", location);
  useEffect(() => {
    document.title = "Moodiify | Home";
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("user");

    setIsLoading(true);

    if (!user) {
      setIsLoading(false);
      setError("User not authenticated. Please log in.");
      navigate("/login");
      return;
    }
    setIsLoading(false);
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, [navigate]);

  useEffect(() => {
    if (isMapVisible) {
      navigate("/global");
    }
  }, [isMapVisible, navigate, location.state, setIsMapVisible]);

  return (
    <div>
      <main className="home">
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
              userData={userData}
              setSongSuggestions={setSongSuggestions}
              setIsVoiceSearch={setIsVoiceSearch}
            />
          )}
          <NavBar user={userData} />
        </header>
        <div className="homeContainer">
          {!isLoading && !error && (
            <>
              {formVisible && !isMapVisible && (
                <Form
                  setSongSuggestions={setSongSuggestions}
                  setFormVisible={setFormVisible}
                  formVisible={formVisible}
                />
              )}
              {songSuggestions.length == 0 && !isMapVisible && (
                <Categories user={userData} />
              )}
              {songSuggestions.length > 0 &&
                !isVoiceSearch &&
                !isMapVisible &&
                !isRecording && (
                  <Songs songSuggestions={songSuggestions} user={userData} />
                )}

              {songSuggestions.length > 0 &&
                !isMapVisible &&
                !isRecording &&
                isVoiceSearch && (
                  <Songs songSuggestions={songSuggestions} user={userData} />
                )}

              {isMapVisible && <MapComponent />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
