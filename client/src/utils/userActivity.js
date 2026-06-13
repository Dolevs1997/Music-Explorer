import axios from "axios";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const updateUserActivity = async (user, fields) => {
  try {
    const response = await axios.put(
      `http://${SERVER_URL}/music-explorer/userActivity/update?id=${user._id}`,
      { activity: fields },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user activity:", error);
    throw error;
  }
};

const changeUserPassword = async (user, currentPassword, newPassword) => {
  try {
    const response = await axios.put(
      `http://${SERVER_URL}/auth/changePassword?id=${user._id}`,
      { currentPassword, newPassword },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      },
    );
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
    const response = await axios.delete(
      `http://${SERVER_URL}/auth/account?id=${user._id}`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

const deleteSongsHistory = async (user) => {
  try {
    const response = await axios.delete(
      `http://${SERVER_URL}/music-explorer/userActivity/songsHistory?id=${user._id}`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      },
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
      `http://${SERVER_URL}/music-explorer/userActivity/songsHistory?id=${user._id}`,
      { song },
      {
        headers: { Authorization: `Bearer ${user.token}` },
      },
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
