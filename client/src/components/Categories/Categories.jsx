import { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import Category from "../Category/Category";
import styles from "./Categories.module.css";
import { useParams, useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getLocaleForCountry } from "../../utils/countryLocalMap";
import { CurrentLocationContext } from "../../Contexts/CurrentLocationContext";
// const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const INITIAL_COUNT = 6;

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const params = useParams();
  // const location = useLocation();

  const userData = JSON.parse(localStorage.getItem("user"));
  const country = params.country || userData?.country?.shortName || "US";
  const { currentLocation } = useContext(CurrentLocationContext);
  // Determine locale based on country code
  const locale = getLocaleForCountry(country);
  useEffect(() => {
    if (userData == null) navigate("/login");
  }, [userData, navigate]);
  useEffect(() => {
    async function fetchGenres() {
      try {
        const response = await axios.get(
          `/api/categories/getAll?limit=50&locale=${locale}`,
        );
        setCategories(response.data.categories.items);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Error fetching categories");
      }
    }
    fetchGenres();
  }, [locale]);
  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_COUNT);

  return (
    <>
      <div className={styles.sectionHead}>
        <div className={styles.sectionTitleBox}>
          <span className={styles.eyebrow}>Browse by genre</span>
          <h2 className={styles.sectionTitle}>Categories</h2>
        </div>
        <button
          type="button"
          className={styles.sectionLink}
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
        >
          {showAll ? "Show less" : "View all →"}
        </button>
      </div>
      <ToastContainer />
      <div className={styles.categories}>
        {visible.map((category) => (
          <Category
            key={category.id}
            category={category}
            country={country}
            location={currentLocation}
          />
        ))}
      </div>
    </>
  );
}

export default Categories;
