import axios from "axios";
async function uploadImageToCloudinary(formData, token) {
  try {
    const response = await axios.post(
      `http://${import.meta.env.VITE_SERVER_URL}/moodiify/upload/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
}
export { uploadImageToCloudinary };
