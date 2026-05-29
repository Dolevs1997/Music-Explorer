import dotenv from "dotenv";
import identify from "../services/MusicRecognition_service";
import defaultOptions from "../config/acr_config";
import SongSchema from "../schemas/Song_schema"; // Import the Song schema
import PlaylistSchema from "../schemas/Playlist_schema";
import { Request, Response } from "express";
import { Options } from "../services/MusicRecognition_service";
import { uploadAudioToCloudinary } from "../services/Cloudniary_service";

dotenv.config();

const getById = async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Please provide id in query params" });
  }
  try {
    const song = await SongSchema.findOne({ videoId: id });
    res.status(200).json(song);
  } catch (err) {
    console.error("Error fetching song by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const recognizeAudio = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "Audio file missing" });
  }
  await uploadAudioToCloudinary(req.file.buffer, req.file.originalname);
  const data: Buffer = req.file.buffer;

  if (!data) {
    return res.status(400).json({ error: "Audio file location missing" });
  }
  identify(
    data,
    defaultOptions as Options,
    async function (err: Error, body: any) {
      if (err) {
        console.error("ACRCloud error:", err);
        return res.status(500).json({ error: "Audio recognition failed" });
      }

      if (!body || !body.metadata || !body.metadata.music) {
        return res.status(400).json({ error: "Unable to recognize audio" });
      }
      // Process the recognized music data
      const musicInfo = body.metadata.music[0];
      res.status(200).json(musicInfo);
    },
  );
};

const deletebyVideoId = async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const user = req.body.user;
  const playlistId = req.body.playlistId;
  if (!videoId || !user || !playlistId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const playlist = await PlaylistSchema.findById(playlistId);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }
  try {
    const song = await SongSchema.findOne({ videoId: videoId });
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // If the song is in multiple playlists, just remove it from this playlist
    song.playlists = song.playlists.filter(
      (pid) => pid.toString() !== playlistId.toString(),
    );
    await song.save();
    playlist.songs = playlist.songs.filter(
      (sid) => sid.toString() !== song._id.toString(),
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
  deletebyVideoId,
};
