import SongSchema from "../schemas/Song_schema";
import { addSongVideo } from "../models/Firestore/songVideo";
import { fetchSong } from "../services/YouTube_service";
import { Request, Response } from "express";

const getAll = async (req: Request, res: Response) => {
  const { song, country } = req.query;
  // console.log("request:", req.token);
  // const result =

  try {
    const songData = await fetchSong(song as string, country as string);
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
  } catch (err: Error | any) {
    return res.status(400).json({ error: err.message });
  }
};

export default { getAll };
