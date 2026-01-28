import PlaylistSchema from "../schemas/Playlist_schema";
import { UserModel } from "../schemas/User_schema";
import SongSchema from "../schemas/Song_schema";
import { Request, Response } from "express";
import { Types } from "mongoose";

// import { updateUser, getUser } from "../models/Firestore/user";
// import { getPlaylistUser } from "../models/Firestore/playlistsUser";

const createPlaylist = async (req: Request, res: Response) => {
  const { song, playlistName, user, videoId } = req.body;

  console.log("createPlaylist in playlist_controller called");
  console.log("song", song);
  console.log("song videoId:", videoId);
  console.log("playlistName", playlistName);
  console.log("user", user);
  if (!playlistName || !user) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  let newSong = null;
  try {
    if (user._id === undefined) {
      return res.status(400).json({ message: "Invalid user data" });
    }
    const userId = user._id; // Assuming you have the user ID from the authentication middleware
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
    // Check if the song already exists
    const existingSong = await SongSchema.findOne({
      song: song,
      videoId: videoId,
    });
    // If the playlist exists, add the song to it
    if (existingPlaylist) {
      if (videoId && song != "") {
        console.log("Playlist exists:", playlistName);

        console.log("existingSong in existingPlaylist:", existingSong);
        if (existingSong) {
          // If the song exists, add the playlist to the song's playlists if not already present
          if (
            !existingSong.playlists.some(
              (playlistId) =>
                playlistId.toString() === existingPlaylist._id.toString(),
            )
          ) {
            existingSong.playlists.push(existingPlaylist._id);
            await existingSong.save();
            console.log(
              "Added existingPlaylist to existingSong:",
              song,
              videoId,
            );

            existingPlaylist.songs.push(existingSong._id);
            await existingPlaylist.save();
            console.log(
              "Added existingSong to existingPlaylist:",
              song,
              videoId,
            );
            return res.status(200).json({
              message: "Song added to existing playlist successfully",
              playlist: existingPlaylist,
            });
          } else {
            console.log(
              "existingPlaylist already in existingSong's playlists:",
              song,
              videoId,
            );
            return res.status(400).json({
              message: "Song already exists in the playlist " + playlistName,
              playlist: existingPlaylist,
            });
          }
        }

        // If the song does not exist, create a new one and add it to the playlist
        else {
          newSong = new SongSchema({
            song: song,
            videoId: videoId,
            playlists: [existingPlaylist._id],
          });
          await newSong.save();

          existingPlaylist.songs.push(newSong._id);
          await existingPlaylist.save();
          console.log("Creating new song in existingPlaylist:", song, videoId);
        }
        console.log("Playlist after update:", existingPlaylist);
        return res.status(200).json({
          message: `Song added to playlist ${playlistName} successfully`,
          playlist: existingPlaylist,
        });
      } else {
        return res.status(400).json({
          message: `playlist ${playlistName} already exists`,
          playlist: existingPlaylist,
        });
      }
    }
    // If the playlist does not exist, create a new one
    else if (!existingPlaylist) {
      console.log("Creating new playlist:", playlistName);
      newPlaylist = new PlaylistSchema({
        name: playlistName,
        user: userId,
        songs: [],
      });
      await newPlaylist.save();

      console.log("existingSong in newPlaylist:", existingSong);
      if (videoId && song != "") {
        if (!existingSong) {
          // Create a new song if it doesn't exist
          console.log("Creating new song in database:", song, videoId);
          newSong = new SongSchema({
            song: song,
            videoId: videoId,
            playlists: [newPlaylist._id],
          });
          await newSong.save();
          console.log("New song created in newPlaylist:", newSong);
          // Add the new song to the new playlist
          newPlaylist.songs.push(newSong._id);
          await newPlaylist.save();
        } else {
          console.log("Using existing song in newPlaylist:", existingSong);
          // Add the existing song to the new playlist
          newPlaylist.songs.push(existingSong._id);
          await newPlaylist.save();

          // Add the new playlist to the existing song's playlists
          existingSong.playlists.push(newPlaylist._id);
          await existingSong.save();
          console.log(
            "Added newPlaylist to existingSong's playlists:",
            song,
            videoId,
          );
        }
      }

      // console.log("New playlist created:", newPlaylist);
      // Add the playlist to the user's playlists
      existingUser.playlists.push(newPlaylist._id); // Add the new playlist to the user's playlists
      console.log(
        "User's playlists after adding new playlist:",
        existingUser.playlists,
      );
      await existingUser.save();

      console.log("Playlist after update:", newPlaylist);
      if (videoId && song != "") {
        return res.status(200).json({
          message: `Song added to playlist ${playlistName} successfully`,
          playlist: newPlaylist,
        });
      } else {
        return res.status(200).json({
          message: `playlist ${playlistName} created successfully`,
          playlist: newPlaylist,
        });
      }
    }
  } catch (error) {
    console.error("Error creating playlist in playlist_controller:", error);
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
    // const userEmail = userObject.email;
    // const playlistName = playlistObject.name;
    // const userRef = await getUser(userEmail);
    // if (!userRef || userRef.error) {
    //   console.error("Error retrieving user from Firestore:", userRef.error);
    //   return res.status(500).json({ message: "Error retrieving user data" });
    // }
    // // console.log("User reference from Firestore:", userRef);
    // const firestorePlaylist = await getPlaylistUser(playlistName, userRef);
    // if (!firestorePlaylist || firestorePlaylist.error) {
    //   console.error(
    //     "Error retrieving playlist from Firestore:",
    //     firestorePlaylist.error
    //   );
    //   return res
    //     .status(500)
    //     .json({ message: "Error retrieving playlist data" });
    // }
    // console.log("Firestore playlist:", firestorePlaylist);
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

export default { createPlaylist, getPlaylistSongs, deletePlaylist };
