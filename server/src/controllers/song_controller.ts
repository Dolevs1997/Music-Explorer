import dotenv from "dotenv";
import identify from "../services/MusicRecognition_service";
import defaultOptions from "../config/acr_config";
import { fetchPlaylistSongs } from "../services/YouTube_service";
import SongSchema from "../schemas/Song_schema"; // Import the Song schema
import PlaylistSchema from "../schemas/Playlist_schema";
import fs from "fs";
import { Request, Response } from "express";
import { Options } from "../services/MusicRecognition_service";
// import { deleteSongUser } from "../models/Firestore/songsUser";
// import { getUser } from "../models/Firestore/user";
// import { getPlaylistUser } from "../models/Firestore/playlistsUser";
dotenv.config();

const getById = async (req: Request, res: Response) => {
  // console.log("GetById called with query:", req.query);
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Please provide id in query params" });
  }
  try {
    const song = await SongSchema.findOne({ videoId: id });
    // console.log("Fetched song by ID:", song);
    res.status(200).json(song);
  } catch (err) {
    console.error("Error fetching song by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const getVideo = async (req, res) => {
//   const controller = new AbortController();
//   const signal = controller.signal;
//   const { videoId, regionCode } = req.query;
//   if (!videoId) {
//     return res
//       .status(400)
//       .json({ error: "Please provide videoId in query params" });
//   }
//   const result = await fetch(
//     `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&regionCode=${regionCode}&key=${API_KEY}`,
//     { signal }
//   );
//   const data = await result.json();
//   res.status(200).json(data);
// };

const recognizeAudio = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "Audio file missing" });
  }

  console.log("options:", defaultOptions);
  let data: Buffer = fs.readFileSync(req.file.path);
  if (!data) {
    return res.status(400).json({ error: "Audio file missing" });
  }
  identify(
    data,
    defaultOptions as Options,
    async function (err: Error, body: any) {
      if (err) console.log(err);
      console.log("ACRCloud response body:", body);
      if (!body || !body.metadata || !body.metadata.music) {
        return res.status(400).json({ error: "Unable to recognize audio" });
      }
      // Process the recognized music data
      const musicInfo = body.metadata.music[0];
      console.log("Recognized music info:", musicInfo);
      // Clean up the uploaded file
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error("Error deleting temporary audio file:", err);
          }
        });
      }
      res.status(200).json(musicInfo);
    }
  );
};

const getAll = async (req: Request, res: Response) => {
  // console.log("song_controller for fetching song playlists");
  const playlistId = req.query.id as string;
  const country = req.query.country as string;
  const result = await fetchPlaylistSongs(playlistId, country);
  if (!result) {
    return res.status(400).json({ error: "No playlist songs found" });
  }
  res.status(200).json(result);
};

const deletebyVideoId = async (req: Request, res: Response) => {
  console.log("DeletebyVideoId called with params:", req.params);
  const { videoId } = req.params;
  const user = req.body.user;
  const playlistId = req.body.playlistId;
  if (!videoId || !user || !playlistId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  // const userRef = await getUser(user.email);
  // if (!userRef || userRef.error) {
  //   console.error("Error retrieving user from Firestore:", userRef.error);
  //   return res.status(500).json({ message: "Error retrieving user data" });
  // }
  const playlist = await PlaylistSchema.findById(playlistId);
  // const playlistRef = await getPlaylistUser(playlist.name, userRef);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }
  try {
    const song = await SongSchema.findOne({ videoId: videoId });
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    } else if (song.playlists.length > 1) {
      // If the song is in multiple playlists, just remove it from this playlist
      song.playlists = song.playlists.filter(
        (pid) => pid.toString() !== playlistId.toString()
      );
      await song.save();
    }
    console.log("handling Firestore deletion for song:", song);
    // const deletedSong = await deleteSongUser(song, playlistRef, userRef);
    // if (!deletedSong) {
    //   return res.status(404).json({ message: "Song not found in user songs" });
    // }
    song.playlists = song.playlists.filter(
      (pid) => pid.toString() !== playlistId.toString()
    );
    await song.save();
    playlist.songs = playlist.songs.filter(
      (sid) => sid.toString() !== song._id.toString()
    );
    await playlist.save();

    //deleting song from user if not in any playlist
    if (song.playlists.length === 0) {
      await SongSchema.findByIdAndDelete(song._id);
    }
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getById,
  recognizeAudio,
  getAll,
  deletebyVideoId,
};
