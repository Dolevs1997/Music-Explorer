import { Request, Response } from "express";
import { UserModel } from "../schemas/User_schema";
import SongModel from "../schemas/Song_schema";
import PlaylistModel from "../schemas/Playlist_schema";
import {
  getRecentSongVideos,
  deleteAllSongs,
  addSongVideo,
} from "../models/Firestore/songVideo";
import { admin } from "../config/firebase_config";
const update = async (req: Request, res: Response) => {
  const userId = req.query.id as string;
  const { activity } = req.body;
  console.log("activity: ", activity);
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
    console.log("user: ", user);
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
    const uid = user._id.toString();
    const recentSongs = await getRecentSongVideos(uid, 50);
    return res.status(200).json({ recentSongs });
  } catch (error) {
    console.error("Error retrieving user activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteHistorySongs = async (req: Request, res: Response) => {
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
    // Implement the logic to delete history songs for the user
    const uid = user._id.toString();
    await deleteAllSongs(uid);
    await PlaylistModel.updateMany({ user: userId }, { $set: { songs: [] } });
    await SongModel.deleteMany();
    return res
      .status(200)
      .json({ message: "History songs deleted successfully" });
  } catch (error) {
    console.error("Error deleting history songs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addHistorySong = async (req: Request, res: Response) => {
  const userId = req.query.id as string;
  console.log("user id: ", userId);
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  // console.log("user: ", user);
  const uid = user._id.toString();
  // console.log("uid: ", uid);
  const { song } = req.body;
  console.log("song: ", song);
  const songVideo = {
    title: song.song,
    videoId: song.videoId,
  };
  const idToken = req.header("Authorization")?.split(" ")[1];
  if (!idToken) {
    return res.status(401).json({ message: "Authorization token is required" });
  }
  try {
    await addSongVideo(uid, songVideo);
    return res.status(200).json({ message: "History song added successfully" });
  } catch (error) {
    console.error("Error adding history song:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export default { update, getHistorySongs, deleteHistorySongs, addHistorySong };
