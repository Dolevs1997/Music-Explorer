/* eslint-disable react/prop-types */
import styles from "./Category.module.css";
import { useState } from "react";
import { useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import { Card } from "@heroui/card";
function Category({ category, token, country, location }) {
  const navigate = useNavigate();
  const [, setPlaylistsCategory] = useState([]);
  async function handleClickCategory(name) {
    const response = await fetch(
      `http://${
        import.meta.env.VITE_SERVER_URL
      }/moodiify/categories/category/?name=${name}&country=${country}&location=${location}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (response.ok) {
      console.log(data);
      setPlaylistsCategory(data);
      toast.success("Redirecting to playlists...");
      navigate("/category/playlists", {
        state: {
          playlistsCategory: data,
          categoryName: name,
          token: token,
          country: country,
          location: location,
        },
      });
    } else {
      toast.error("Error fetching playlists. Please try again.");
      console.log("Error fetching playlists:", data.message);
      console.error("Error fetching playlists:", data.message);
    }
  }
  return (
    <>
      <Toaster />
      <div className={styles.category}>
        <Card
          isFooterBlurred
          className="border-none"
          radius="lg"
          onClick={() => handleClickCategory(category.name)}
        >
          <div className={styles.categoryContent}>
            <img
              src={category.icons[0].url}
              alt={category.name}
              onClick={() => handleClickCategory(category.name)}
            />
            <p>{category.name}</p>
          </div>
        </Card>
        {/* <img
          src={category.icons[0].url}
          alt={category.name}
          onClick={() => handleClickCategory(category.name)}
        />
        <h3>{category.name}</h3> */}
      </div>
    </>
  );
}

export default Category;
