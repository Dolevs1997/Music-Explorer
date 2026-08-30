import axios from "axios";

async function fetchSongYT(song, country, user, excludedVideoIds = []) {
  const response = await axios.get(`/api/recommends/`, {
    params: { song, country, excludedVideoIds: excludedVideoIds.join(",") },

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
  });
  return response.data;
}

async function fetchSongsYT(songs, country, user, excludedVideoIds = []) {
  const response = await axios.post(
    `/api/recommends/batch`,
    { songs, country, excludedVideoIds },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    },
  );
  return response.data;
}

export { fetchSongYT, fetchSongsYT };
