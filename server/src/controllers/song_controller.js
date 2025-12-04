const dotenv = require("dotenv");
dotenv.config();
const API_KEY = process.env.YOUTUBE_API_KEY;
const identify = require("../services/MusicRecognition_service");
const defaultOptions = require("../config/acr_config"); // your ACRCloud keys
const { fetchPlaylistSongs } = require("../services/YouTube_service");
const SongSchema = require("../schemas/Song_schema"); // Import the Song schema
const PlaylistSchema = require("../schemas/Playlist_schema"); // Import the Playlist schema
const fs = require("fs");

const getById = async (req, res) => {
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

const getVideo = async (req, res) => {
  const controller = new AbortController();
  const signal = controller.signal;
  const { videoId, regionCode } = req.query;
  if (!videoId) {
    return res
      .status(400)
      .json({ error: "Please provide videoId in query params" });
  }
  const result = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&regionCode=${regionCode}&key=${API_KEY}`,
    { signal }
  );
  const data = await result.json();
  res.status(200).json(data);
};

const recognizeAudio = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Audio file missing" });
  }

  console.log("options:", defaultOptions);
  let data = fs.readFileSync(req.file.path);
  if (!data) {
    return res.status(400).json({ error: "Audio file missing" });
  }
  identify(data, defaultOptions.default, async function (err, body) {
    if (err) console.log(err);
    console.log("ACRCloud response body:", body);
    if (!body || !body.metadata || !body.metadata.music) {
      return res.status(400).json({ error: "Unable to recognize audio" });
    }
    // Process the recognized music data
    const musicInfo = body.metadata.music[0];
    console.log("Recognized music info:", musicInfo);
    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting temporary audio file:", err);
      }
    });
    res.status(200).json(musicInfo);
  });
};

const getAll = async (req, res) => {
  const playlistId = req.query.id;
  const result = await fetchPlaylistSongs(playlistId);
  if (!result) {
    return res.status(400).json({ error: "No playlist songs found" });
  }
  res.status(200).json(result);
};

const deletebyId = async (req, res) => {
  console.log("DeletebyId called with params:", req.params);
  const { videoId } = req.params;
  try {
    const song = await SongSchema.findOneAndDelete({ videoId: videoId });
    console.log("Deleted song:", song);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }
    // Remove the song from all playlists
    await PlaylistSchema.updateMany(
      { songs: videoId },
      { $pull: { songs: videoId } }
    );
    res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("Error deleting song:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { getVideo, recognizeAudio, getAll, deletebyId, getById };
