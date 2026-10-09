import styles from "./Search.module.css";

import { useNavigate } from "react-router";
import { useContext, useState, useEffect, useRef } from "react";
import { SearchContext } from "../../Contexts/SearchContext";
import { Spinner } from "../../components/ui/spinner";
import { toast } from "react-hot-toast";
import { getSongSuggestions } from "../../services/OpenAI_service";
import { deduplicateSongs } from "../../utils/deduplicateSongs";
import { fetchSongsYT } from "../../services/YouTube_service";
import propTypes from "prop-types";
import Voice from "../Voice/Voice";
import Record from "../Record/Record";
import UserContext from "../../Contexts/UserContext";
export default function Search({ setSongSuggestions }) {
  const {
    formVisible,
    setFormVisible,
    isMapVisible,
    setIsMapVisible,
    setIsRecording,
    setIsVoiceSearch,
  } = useContext(SearchContext);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");
  const { user } = useContext(UserContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    const text = document.getElementById("text").value;
    const payload = {
      content: text,
      role: "user",
    };
    try {
      const response = await getSongSuggestions(payload);
      const uniqueSongs = deduplicateSongs(response);
      const recommendations = await fetchSongsYT(
        uniqueSongs,
        user.country?.shortName || "US",
      );
      console.log("recommendations: ", recommendations);
      setSongSuggestions(recommendations);
      setFormVisible(!formVisible);
      setText("");
      if (recommendations.length === 0) {
        alert("No song suggestions found. Please try again.");
      } else {
        navigate("/home/songSuggestions");
      }
    } catch (err) {
      console.error("error fetching song suggestions: ", err);
      toast.error("Error getting song suggestions...");
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e) {
    setText(e.target.value);
  }

  // Close menu when clicking outside
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [mobileMenuOpen]);

  const handleMapClick = () => {
    setMobileMenuOpen(false);
    setIsMapVisible(!isMapVisible);
    navigate("/global");
  };
  return (
    <div>
      {/* Text Search */}
      <form className={styles.searchBar}>
        <input
          placeholder="Describe your tracks"
          value={text}
          onChange={handleChange}
        ></input>
      </form>
      <div className={styles.searchTools}>
        <Voice />
        <Record setSongSuggestions={setSongSuggestions} />
        {/* Explore Global */}
        <button onClick={handleMapClick}>
          <img src="/earth_i.png" alt="Explore" />
        </button>
      </div>
    </div>
  );
}

Search.propTypes = {
  setSongSuggestions: propTypes.func,
};
