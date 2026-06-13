import axios from "axios";

async function fetchSongYT(song, country, user) {
  const response = await axios.get(
    `http://${
      import.meta.env.VITE_SERVER_URL
    }/music-explorer/recommends/?song=${song}&country=${country}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    },
  );
  return response.data;
}

export { fetchSongYT };
