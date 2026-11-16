import PlaylistSchema from "../schemas/Playlist_schema";
import { UserModel } from "../schemas/User_schema";
import SongSchema from "../schemas/Song_schema";
import { Request, Response } from "express";
import { Types } from "mongoose";

const updatePlaylist = async (req: Request, res: Response) => {
  // Implementation for updating a playlist
  console.log("Request: ", req.body);
  const { id } = req.query;
  const playlist = await PlaylistSchema.findById(id);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  const updates = req.body;
  if (Object.keys(updates).length > 0) Object.assign(playlist, updates);
  await playlist.save();
  return res
    .status(200)
    .json({ message: "Playlist updated successfully", playlist });
};
const createPlaylist = async (req: Request, res: Response) => {
  const { playlistName, user } = req.body;
  if (!playlistName || !user) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const userId = user._id;
  let newPlaylist;

  // Check if the user exists
  const existingUser = await UserModel.findById(userId);
  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }
  const DEFAULT_COVERS = [
    "cover-1-violet",
    "cover-2-sky",
    "cover-3-sunset",
    "cover-4-amber",
    "cover-5-teal",
    "cover-6-crimson",
    "cover-7-indigo",
  ];
  const defaultCover =
    DEFAULT_COVERS[Math.floor(Math.random() * DEFAULT_COVERS.length)];
  newPlaylist = new PlaylistSchema({
    name: playlistName,
    user: userId,
    songs: [],
    imageUrl: defaultCover,
  });
  await newPlaylist.save();
  // Add the playlist to the user's playlists
  existingUser.playlists.push(newPlaylist._id);

  await existingUser.save();
  return res.status(200).json({
    message: `playlist ${playlistName} created successfully`,
    playlist: newPlaylist,
  });
};

const addSongToPlaylist = async (req: Request, res: Response) => {
  const { song, videoId, album, duration } = req.body;
  const playlistId = req.query.id;
  console.log("song: ", song);
  console.log("videoId: ", videoId);
  console.log("album: ", album);
  console.log("duration: ", duration);
  if (!song || !videoId || !playlistId || !album || !duration) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const playlist = await PlaylistSchema.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    let existingSong = await SongSchema.findOne({ videoId: videoId });
    if (existingSong) {
      if (existingSong.playlists.some((id) => id.toString() === playlistId)) {
        return res.status(400).json({ message: "Song already in playlist" });
      }
      // Keep a consistent song title if the stored record is missing or outdated.
      if (!existingSong.song || existingSong.song !== song) {
        existingSong.song = song;
      }
      existingSong.playlists.push(playlist._id);
      await existingSong.save();
      playlist.songs.push(existingSong._id);
      await playlist.save();
      const populatedPlaylist =
        await PlaylistSchema.findById(playlistId).populate("songs");
      return res.status(200).json({
        message: "Song added to playlist successfully",
        playlist: populatedPlaylist,
      });
    } else {
      const newSong = new SongSchema({
        song: song,
        videoId: videoId,
        album: album,
        duration: duration,
        playlists: [playlist._id],
      });
      await newSong.save();
      playlist.songs.push(newSong._id);
      await playlist.save();
      const populatedPlaylist =
        await PlaylistSchema.findById(playlistId).populate("songs");
      return res.status(200).json({
        message: "Song added to playlist successfully",
        playlist: populatedPlaylist,
      });
    }
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPlaylistSongs = async (req: Request, res: Response) => {
  const playlistId = req.query.id;
  try {
    const playlistObject = await PlaylistSchema.findById(playlistId);
    if (!playlistObject) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    const userId: Types.ObjectId = playlistObject.user;
    const userObject = await UserModel.findById(userId);
    if (!userObject) {
      return res.status(404).json({ message: "User not found" });
    }

    const playlist =
      await PlaylistSchema.findById(playlistId).populate("songs");
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.status(200).send(playlist);
  } catch (error) {
    console.error("Error getting playlist songs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const deletePlaylist = async (req: Request, res: Response) => {
  const playlistId = req.query.id;
  try {
    const playlist = await PlaylistSchema.findByIdAndDelete(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    // Also remove the playlist reference from the user's playlists
    const user = await UserModel.findById(playlist.user);
    if (user) {
      user.playlists = user.playlists.filter(
        (id) => id.toString() !== playlistId,
      );
      await user.save();
    }
    const songs = await SongSchema.find({ playlists: playlist._id });
    for (const song of songs) {
      song.playlists = song.playlists.filter(
        (id) => id.toString() !== playlistId,
      );
      await song.save();
    }
    return res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  createPlaylist,
  getPlaylistSongs,
  deletePlaylist,
  updatePlaylist,
  addSongToPlaylist,
};
