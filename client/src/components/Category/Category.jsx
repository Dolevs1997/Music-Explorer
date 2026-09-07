/* eslint-disable react/prop-types */
import styles from "./Category.module.css";
import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Card } from "@heroui/card";
import axios from "axios";
function Category({ category, country, location }) {
  const navigate = useNavigate();
  const [, setPlaylistsCategory] = useState([]);
  async function handleClickCategory(name) {
    const response = await axios.get(
      `/api/categories/category/?name=${name}&country=${country}&location=${location}`,
    );
    const data = await response.data;
    if (response.status === 200) {
      setPlaylistsCategory(data);
      // toast.success("Redirecting to playlists...");
      navigate("/category/playlists", {
        state: {
          playlistsCategory: data,
          categoryName: name,
          country: country,
          location: location,
        },
      });
    } else {
      toast.error("Error fetching playlists. Please try again.");
      console.error("Error fetching playlists:", data.message);
    }
  }
  return (
    <>
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
