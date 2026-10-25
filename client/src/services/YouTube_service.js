import axios from "axios";

async function fetchSongYT(song, country) {
  const response = await axios.get(`/api/recommends/`, {
    params: { song, country },
  });
  return response.data;
}

async function fetchSongsYT(songs, country) {
  const response = await axios.post(`/api/recommends/batch`, {
    songs,
    country,
  });
  return response.data;
}

export { fetchSongYT, fetchSongsYT };
