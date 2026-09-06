import axios from "axios";
// const SERVER_URL = import.meta.env.VITE_SERVER_URL;
async function getSongSuggestions(payload) {
  try {
    const response = await axios.post(`/api/openai`, payload);
    console.log("response from getSongSuggestions:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching song suggestions:", error);
    throw error;
  }
}

async function generateImagePlaylist(prompt) {
  const response = await axios.post(`/api/openai/playlist/generate-image`, {
    prompt,
  });
  return response.data;
}

export { getSongSuggestions, generateImagePlaylist };
