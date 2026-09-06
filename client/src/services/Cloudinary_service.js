import axios from "axios";
async function uploadImageToCloudinary(formData) {
  try {
    const response = await axios.post(`/api/upload/`, formData);
    return response;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
}
export { uploadImageToCloudinary };
