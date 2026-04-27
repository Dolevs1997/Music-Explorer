import { Request, Response } from "express";
import { UserModel } from "../schemas/User_schema";
import { getRecentSongVideos } from "../models/Firestore/songVideo";
import { updatePasswordForUser } from "../models/Firestore/userAuth";
const update = async (req: Request, res: Response) => {
  const userId = req.query.id as string;
  const { activity } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  if (!activity) {
    return res.status(400).json({ message: "Activity data is required" });
  }
  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: activity },
      { new: true },
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User activity updated successfully", user });
  } catch (error) {
    console.error("Error updating user activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getHistorySongs = async (req: Request, res: Response) => {
  const userId = req.query.id as string;
  console.log("user id: ", userId);
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const recentSongs = await getRecentSongVideos(50);
    return res.status(200).json({ recentSongs });
  } catch (error) {
    console.error("Error retrieving user activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const changePassword = async (req: Request, res: Response) => {
  const userId = req.query.id as string;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new passwords are required" });
  }

  try {
    await updatePasswordForUser(currentPassword, newPassword);
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error: Error | any) {
    const msg =
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
        ? "Current password is incorrect."
        : error.code === "auth/weak-password"
          ? "New password is too weak."
          : "Failed to change password. Please try again.";
    throw new Error(msg);
  }
};
export default { update, getHistorySongs, changePassword };
