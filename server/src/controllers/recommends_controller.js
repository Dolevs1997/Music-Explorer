const SongSchema = require("../schemas/Song_schema");
const { addSongVideo } = require("../models/Firestore/songVideo");
const { fetchSong } = require("../services/YouTube_service");

const getAll = async (req, res) => {
  const { song, country } = req.query;
  // console.log("request:", req.token);
  // const result =

  try {
    const songData = await fetchSong(song, country);
    if (!songData) {
      return res.status(404).json({ error: "No song data from YouTube" });
    }
    const videoId = songData.videoId;
    const existingSong = await SongSchema.findOne({ videoId: videoId });
    if (existingSong) {
      // console.log("Song already exists in the database:", existingSong);

      return res.status(200).json(existingSong);
    }
    const songVideo = {
      title: songData.title,
      videoId: videoId,
    };
    await addSongVideo(songVideo);

    return res.status(200).json({
      song: songData.title,
      videoId: videoId,
      regionCode: country,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = { getAll };
