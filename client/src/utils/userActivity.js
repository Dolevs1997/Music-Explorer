import axios from "axios";
// const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const updateUserActivity = async (user, fields) => {
  try {
    const response = await axios.put(
      `/api/userActivity/update?id=${user._id}`,
      { activity: fields },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user activity:", error);
    throw error;
  }
};

const changeUserPassword = async (user, currentPassword, newPassword) => {
  try {
    const response = await axios.put(`/auth/changePassword?id=${user._id}`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error changing user password:", error);
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to change password. Please try again.");
  }
};
const deleteAccount = async (user) => {
  try {
    const response = await axios.delete(`/auth/account?id=${user._id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

const deleteSongsHistory = async (user) => {
  try {
    const response = await axios.delete(
      `/api/userActivity/songsHistory?id=${user._id}`,
    );
    return response;
  } catch (error) {
    console.error("Error deleting songs history:", error);
    throw error;
  }
};

const addSongToHistory = async (user, song) => {
  try {
    const response = await axios.post(
      `/api/userActivity/songsHistory?id=${user._id}`,
      { song },
    );
    return response;
  } catch (error) {
    console.error("Error adding song to history:", error);
    throw error;
  }
};

export {
  updateUserActivity,
  changeUserPassword,
  deleteAccount,
  deleteSongsHistory,
  addSongToHistory,
};
