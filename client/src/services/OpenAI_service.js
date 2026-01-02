import axios from "axios";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const getSongSuggestions = async (text, token) => {
  const payload = {
    text: text,
    role: "user",
  };
  try {
    const response = await axios.post(
      `http://${SERVER_URL}/api/openai`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // console.log("response: \n", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching song suggestions:", error);
    throw error;
  }
};

export { getSongSuggestions };
