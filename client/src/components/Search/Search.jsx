import styles from "./Search.module.css";
import { useNavigate } from "react-router";
import { useContext, useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { getSongSuggestions } from "../../services/OpenAI_service";
import { deduplicateSongs } from "../../utils/deduplicateSongs";
import { fetchSongsYT } from "../../services/YouTube_service";
import propTypes from "prop-types";
import Voice from "../Voice/Voice";
import Record from "../Record/Record";
import UserContext from "../../Contexts/UserContext";
import Global from "../Global/Global";
import { ArrowRight } from "lucide-react";

export default function Search({ setSongSuggestions }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useContext(UserContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const content = searchQuery.trim();
    if (!content) return;

    setIsLoading(true);
    const payload = {
      content,
      role: "user",
    };
    try {
      const response = await getSongSuggestions(payload);
      const uniqueSongs = deduplicateSongs(response);
      const recommendations = await fetchSongsYT(
        uniqueSongs,
        user.country?.shortName || "US",
      );
      // console.log("recommendations: ", recommendations);
      setSongSuggestions(recommendations);
      setSearchQuery("");
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
    setSearchQuery(e.target.value);
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

  return (
    <div className={styles.searchContainer}>
      {/* Text Search */}
      <form className={styles.searchBar} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Describe your tracks"
          value={searchQuery}
          onChange={handleChange}
        />
        <button
          className={styles.submitFormButton}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : <ArrowRight />}
        </button>
      </form>
      <div className={styles.searchTools}>
        <Voice />
        <Record setSongSuggestions={setSongSuggestions} />
        <Global />
        {/* Explore Global */}
      </div>
    </div>
  );
}

Search.propTypes = {
  setSongSuggestions: propTypes.func,
};
