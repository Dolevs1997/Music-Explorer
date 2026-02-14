import PlaylistSchema from "../schemas/Playlist_schema";
import { UserModel } from "../schemas/User_schema";
import SongSchema from "../schemas/Song_schema";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { uploadToCloudinary } from "../services/Cloudniary_service";
// import { generatePlaylistPicture } from "../services/OpenAI_service";
// import { updateUser, getUser } from "../models/Firestore/user";
// import { getPlaylistUser } from "../models/Firestore/playlistsUser";
const updatePlaylist = async (req: Request, res: Response) => {
  // Implementation for updating a playlist
  const { id } = req.query;
  // console.log("Updating playlist with ID:", id);
  const playlist = await PlaylistSchema.findById(id);

  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }
  console.log("playlist: ", playlist);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }
  if (req.file) {
    try {
      console.log("Received file upload request");
      // console.log(req);
      const file = req.file;
      console.log("filePath: ", file);

      const { data } = await uploadToCloudinary(file.buffer, file.originalname);
      const imageUrl = data?.secure_url;
      console.log("imageUrl: ", imageUrl);
      if (!imageUrl) {
        return res
          .status(500)
          .json({ error: "Failed to retrieve image URL from Cloudinary" });
      }
      playlist.imageUrl = imageUrl;
    } catch (error: Error | any) {
      res.status(500).json({ error: error.message });
    }
  }
  const updates = req.body;
  if (Object.keys(updates).length > 0) Object.assign(playlist, updates);
  await playlist.save();
  return res
    .status(200)
    .json({ message: "Playlist updated successfully", playlist });
  // } else if (req.body.generateImage) {
  //   try {
  //     const description =
  //       req.body.description ||
  //       `Generate an image for playlist: ${playlist.name}`;
  //     console.log("description: ", description);
  //     const result = await generatePlaylistPicture(description);

  //     // Save base64 to Cloudinary
  //     const image_base64 = result.data[0].b64_json;
  //     // console.log("result: ", result);
  //     if (!result.data || result.data.length === 0 || !image_base64) {
  //       throw new Error("Image generation failed");
  //     }

  //     const image_bytes = Buffer.from(image_base64, "base64");

  //     const { data } = await uploadToCloudinary(
  //       image_bytes,
  //       `playlist-${id}-${Date.now()}.png`,
  //     );

  //     playlist.imageUrl = data?.secure_url;
  //     console.log("playlist imageUrl: ", playlist.imageUrl);
  //     await playlist.save();
  //     res.status(200).json({ playlist });
  //   } catch (error: Error | any) {
  //     res.status(500).json({ error: error.message });
  //   }
  // }
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

  // Check if the playlist already exists for the user
  const existingPlaylist = await PlaylistSchema.findOne({
    name: playlistName,
    user: userId,
  });

  if (existingPlaylist) {
    return res.status(400).json({
      message: `playlist ${playlistName} already exists`,
      playlist: existingPlaylist,
    });
  }

  // If the playlist does not exist, create a new one
  else {
    console.log("Creating new playlist:", playlistName);
    // //generate image for playlist: //
    // const description = `generate an image for playlist ${playlistName} music, I want it to be match the playlist name`;

    // const response = await generatePlaylistPicture(description);
    // console.log("response: ", response);

    newPlaylist = new PlaylistSchema({
      name: playlistName,
      user: userId,
      songs: [],
    });
    await newPlaylist.save();
    // Add the playlist to the user's playlists
    existingUser.playlists.push(newPlaylist._id);

    await existingUser.save();
    return res.status(200).json({
      message: `playlist ${playlistName} created successfully`,
      playlist: newPlaylist,
    });
  }
};

const addSongToPlaylist = async (req: Request, res: Response) => {
  const { song, videoId } = req.body;
  const playlistId = req.query.id;
  console.log("addSongToPlaylist called with:", song, videoId, playlistId);
  if (!song || !videoId || !playlistId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const playlist = await PlaylistSchema.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    let existingSong = await SongSchema.findOne({
      song: song,
      videoId: videoId,
    });
    if (existingSong) {
      if (existingSong.playlists.some((id) => id.toString() === playlistId)) {
        return res.status(400).json({ message: "Song already in playlist" });
      }
      existingSong.playlists.push(playlist._id);
      await existingSong.save();
      playlist.songs.push(existingSong._id);
      await playlist.save();
      return res
        .status(200)
        .json({ message: "Song added to playlist successfully", playlist });
    } else {
      const newSong = new SongSchema({
        song: song,
        videoId: videoId,
        playlists: [playlist._id],
      });
      await newSong.save();
      playlist.songs.push(newSong._id);
      await playlist.save();
      return res
        .status(200)
        .json({ message: "Song added to playlist successfully", playlist });
    }
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPlaylistSongs = async (req: Request, res: Response) => {
  console.log("Getting playlist songs");
  console.log("Request query ID:", req.query.id);

  const playlistId = req.query.id;
  try {
    const playlistObject = await PlaylistSchema.findById(playlistId);
    // console.log("Playlist object:", playlistObject);
    if (!playlistObject) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    const userId: Types.ObjectId = playlistObject.user;
    const userObject = await UserModel.findById(userId);
    // console.log("User object:", userObject);
    if (!userObject) {
      return res.status(404).json({ message: "User not found" });
    }

    const playlist =
      await PlaylistSchema.findById(playlistId).populate("songs");
    console.log("Playlist with populated songs:", playlist);

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
  console.log("Deleting playlist with ID:", playlistId);
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
