import axios from "axios";

const updateUserActivity = async (user, fields) => {
  try {
    const response = await axios.put(
      `http://${import.meta.env.VITE_SERVER_URL}/moodiify/userActivity/update?id=${user._id}`,
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

export default updateUserActivity;
