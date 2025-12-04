const PlaylistSchema = require("../schemas/Playlist_schema");
const UserSchema = require("../schemas/User_schema");
const SongSchema = require("../schemas/Song_schema");
const { updateUser, getUser } = require("../models/Firestore/user");
const { getPlaylistUser } = require("../models/Firestore/playlistsUser");

const createPlaylist = async (req, res) => {
  const { song, playlistName, user, videoId } = req.body;

  console.log("createPlaylist in playlist_controller called");
  console.log("song", song);
  console.log("song videoId:", videoId);
  console.log("playlistName", playlistName);
  console.log("user", user);
  if (!song || !playlistName || !user || !videoId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  let newSong = null;
  try {
    const userId = user._id; // Assuming you have the user ID from the authentication middleware
    let newPlaylist;

    // Check if the user exists
    const existingUser = await UserSchema.findById(userId);
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
      console.log("Playlist exists:", playlistName);

      console.log("existingSong in existingPlaylist:", existingSong);
      if (existingSong) {
        // If the song exists, add the playlist to the song's playlists if not already present
        if (
          !existingSong.playlists.some(
            (playlistId) =>
              playlistId.toString() === existingPlaylist._id.toString()
          )
        ) {
          existingSong.playlists.push(existingPlaylist._id);
          await existingSong.save();
          console.log("Added existingPlaylist to existingSong:", song, videoId);
          const firestoreUpdate = await updateUser(
            existingUser.email,
            { name: playlistName, user: userId },
            existingSong
          );
          if (firestoreUpdate.error) {
            console.error(
              "Error updating user in Firestore:",
              firestoreUpdate.error
            );
            return res
              .status(500)
              .json({ message: "Error updating user in Firestore" });
          }
          existingPlaylist.songs.push(existingSong._id);
          await existingPlaylist.save();
          console.log("Added existingSong to existingPlaylist:", song, videoId);
          return res.status(200).json({
            message: "Song added to existing playlist successfully",
            playlist: existingPlaylist,
          });
        } else {
          console.log(
            "existingPlaylist already in existingSong's playlists:",
            song,
            videoId
          );
          return res.status(200).json({
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
        newSong = existingSong;
        console.log("Using existing song in newPlaylist:", newSong);
        // Add the existing song to the new playlist
        newPlaylist.songs.push(newSong._id);
        await newPlaylist.save();

        // Add the new playlist to the existing song's playlists
        existingSong.playlists.push(newPlaylist._id);
        await existingSong.save();
        console.log(
          "Added newPlaylist to existingSong's playlists:",
          song,
          videoId
        );
      }

      // console.log("New playlist created:", newPlaylist);
      // Add the playlist to the user's playlists
      existingUser.playlists.push(newPlaylist._id); // Add the new playlist to the user's playlists
      console.log(
        "User's playlists after adding new playlist:",
        existingUser.playlists
      );
      await existingUser.save();
    }

    // console.log("new songs:", newSong);
    console.log("***********************************************************");
    console.log("Updating user in Firestore with playlist and song");
    const firestoreUpdate = await updateUser(
      existingUser.email,
      { name: playlistName, user: userId },
      newSong
    );
    if (firestoreUpdate.error) {
      console.error("Error updating user in Firestore:", firestoreUpdate.error);
      return res
        .status(500)
        .json({ message: "Error updating user in Firestore" });
    }
    const playlist = existingPlaylist ? existingPlaylist : newPlaylist;
    console.log("Playlist after update:", playlist);
    return res.status(200).json({
      message: "Song added to existing playlist successfully",
      playlist: playlist,
    });
  } catch (error) {
    console.error("Error creating playlist in playlist_controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPlaylistSongs = async (req, res) => {
  console.log("Getting playlist songs");
  console.log("Request query ID:", req.query.id);

  const playlistId = req.query.id;
  try {
    const playlistObject = await PlaylistSchema.findById(playlistId);
    // console.log("Playlist object:", playlistObject);
    if (!playlistObject) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    const userId = playlistObject.user;
    const userObject = await UserSchema.findById(userId);
    // console.log("User object:", userObject);
    if (!userObject) {
      return res.status(404).json({ message: "User not found" });
    }
    const userEmail = userObject.email;
    const playlistName = playlistObject.name;
    const userRef = await getUser(userEmail);
    if (!userRef || userRef.error) {
      console.error("Error retrieving user from Firestore:", userRef.error);
      return res.status(500).json({ message: "Error retrieving user data" });
    }
    // console.log("User reference from Firestore:", userRef);
    const firestorePlaylist = await getPlaylistUser(playlistName, userRef);
    if (!firestorePlaylist || firestorePlaylist.error) {
      console.error(
        "Error retrieving playlist from Firestore:",
        firestorePlaylist.error
      );
      return res
        .status(500)
        .json({ message: "Error retrieving playlist data" });
    }
    // console.log("Firestore playlist:", firestorePlaylist);
    const playlist = await PlaylistSchema.findById(playlistId).populate(
      "songs"
    );
    console.log("Playlist with populated songs:", playlist);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    const songs = playlist.songs;
    res.status(200).json({ songs: songs });
  } catch (error) {
    console.error("Error getting playlist songs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const deleteSong = async (req, res) => {
  console.log("Deleting song from playlist");
  const { playlistId, songId } = req.body;
  try {
    const playlist = await PlaylistSchema.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    const songIndex = playlist.songs.indexOf(songId);
    if (songIndex === -1) {
      return res.status(404).json({ message: "Song not found in playlist" });
    }
    playlist.songs.splice(songIndex, 1);
    await playlist.save();

    res
      .status(200)
      .json({ message: "Song deleted from playlist successfully" });
  } catch (error) {
    console.error("Error deleting song from playlist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createPlaylist,
  getPlaylistSongs,
  deleteSong,
};
