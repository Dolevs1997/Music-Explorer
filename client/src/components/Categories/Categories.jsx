/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import Category from "../Category/Category";
import styles from "./Categories.module.css";
import { Link, useParams, useLocation, useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { countryToLocale } from "../../utils/countryLocalMap";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
function Categories({ formVisible }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const params = useParams();
  const country = params.country || "US";
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("user"));

  const [currentLocation, setCurrentLocation] = useState(
    location.state?.locationName || "United States",
  );
  console.log("current location: ", currentLocation);
  // Determine locale based on country code
  const locale = countryToLocale[country] || "en_US"; // fallback to English
  let limit = categories.length === 0 ? 6 : categories.length;
  //console.log("categories");
  // console.log("user token in Categories:", user);
  useEffect(() => {
    if (userData == null) navigate("/login");
  });
  useEffect(() => {
    if (location.state?.locationName) {
      setCurrentLocation(location.state.locationName);
    }
  }, [location.state]);
  useEffect(() => {
    document.title = "Moodiify | Categories";
  }, []);

  useEffect(
    function () {
      async function fetchGenres() {
        try {
          const response = await axios.get(
            `http://${SERVER_URL}/moodiify/categories/getAll?limit=${limit}&locale=${locale}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userData.token}`,
              },
            },
          );

          setCategories(response.data.categories.items);
        } catch (error) {
          console.error("Error fetching categories:", error);
          toast.error("Error fetching categories", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            newestOnTop: true,
            rtl: false,
            theme: "light",
          });
        }
      }
      fetchGenres();
    },
    [limit, locale, userData.token],
  );

  async function handleShowCategories(show) {
    try {
      if (show == "show more") {
        setShowMore(true);
      } else if (show == "show less") {
        setShowMore(false);
      }

      limit = showMore ? 6 : 50;

      const response = await axios.get(
        `http://${SERVER_URL}/moodiify/categories/getAll?limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${userData.token}`,
          },
        },
      );
      if (response.status !== 200) {
        console.error("Error fetching categories:", response.statusText);
      } else {
        setCategories(response.data.categories.items);
        // if (showMore === true) {
        //   navigate("/home");
        // }
        // if (showMore === false) {
        //   navigate("/home/categories");
        // }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("unable to show more Categories", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        rtl: false,
        draggable: true,
        theme: "light",
      });
    }
  }

  return (
    <div className={formVisible ? "homeContainerWithForm" : "homeContainer"}>
      <h1>Categories</h1>

      <ToastContainer />
      <div className={styles.categories}>
        {categories
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((category) => (
            <Category
              key={category.id}
              category={category}
              token={userData.token}
              country={country}
              location={currentLocation}
            />
          ))}
      </div>
      {!showMore ? (
        <Link
          className="link"
          onClick={() => handleShowCategories("show more")}
        >
          Show More
        </Link>
      ) : (
        <Link
          className="link"
          onClick={() => handleShowCategories("show less")}
        >
          Show Less
        </Link>
      )}
    </div>
  );
}

export default Categories;
