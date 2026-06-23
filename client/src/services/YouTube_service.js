import axios from "axios";

async function fetchSongYT(song, country, user) {
  console.log("song: ", song);
  const response = await axios.get(
    `http://${import.meta.env.VITE_SERVER_URL}/music-explorer/recommends/`,
    {
      params: { song, country },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    },
  );
  return response.data;
}

export { fetchSongYT };
