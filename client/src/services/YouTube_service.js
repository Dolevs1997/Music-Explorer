import axios from "axios";

async function fetchSongYT(song, country, user, excludedVideoIds = []) {
  // console.log("song: ", song);
  console.log("excludedVideoIds: ", excludedVideoIds);
  const response = await axios.get(
    `http://${import.meta.env.VITE_SERVER_URL}/music-explorer/recommends/`,
    {
      params: { song, country, excludedVideoIds: excludedVideoIds.join(",") },

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    },
  );
  return response.data;
}

export { fetchSongYT };
