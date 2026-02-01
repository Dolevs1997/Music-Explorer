import axios from "axios";
async function uploadImageToCloudinary(formData, token) {
  console.log(formData);
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
    console.log("Cloudinary response:", response);
    return response;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
}
export { uploadImageToCloudinary };
