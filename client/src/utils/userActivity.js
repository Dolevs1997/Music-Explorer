import axios from "axios";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const updateUserActivity = async (user, fields) => {
  try {
    const response = await axios.put(
      `http://${SERVER_URL}/moodiify/userActivity/update?id=${user._id}`,
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
      `http://${SERVER_URL}/moodiify/userActivity/changePassword?id=${user._id}`,
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
    throw error;
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
    if (!response.ok) throw new Error();
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};
export { updateUserActivity, changeUserPassword, deleteAccount };
