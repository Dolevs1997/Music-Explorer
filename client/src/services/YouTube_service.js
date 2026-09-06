import axios from "axios";

async function fetchSongYT(song, country, excludedVideoIds = []) {
  const response = await axios.get(`/api/recommends/`, {
    params: { song, country, excludedVideoIds: excludedVideoIds.join(",") },
  });
  console.log("fetchSongYT response:", response.data); // Log the response data
  return response.data;
}

async function fetchSongsYT(songs, country, excludedVideoIds = []) {
  const response = await axios.post(`/api/recommends/batch`, {
    songs,
    country,
    excludedVideoIds,
  });
  return response.data;
}

export { fetchSongYT, fetchSongsYT };
