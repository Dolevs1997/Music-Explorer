import SongSchema from "../schemas/Song_schema";
import { fetchSong } from "../services/YouTube_service";
import { Request, Response } from "express";

const getAll = async (req: Request, res: Response) => {
  const song = req.query?.song as string;
  const country = (req.query?.country || "US") as string;
  const excludedVideoIdsParam = req.query?.excludedVideoIds as
    | string
    | string[];
  console.log("Excluded Video IDs Param:", excludedVideoIdsParam); // Debugging line
  const excludedVideoIds = Array.isArray(excludedVideoIdsParam)
    ? excludedVideoIdsParam
    : typeof excludedVideoIdsParam === "string"
      ? excludedVideoIdsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];
  console.log("Excluded Video IDs Array:", excludedVideoIds); // Debugging line
  try {
    if (!song) return res.status(400).json({ error: "Missing song parameter" });
    const songData = await fetchSong(
      song as string,
      country as string,
      excludedVideoIds as string[],
    );
    if (!songData) {
      return res
        .status(404)
        .json({ error: "No unique song data from YouTube" });
    }
    const videoId = songData.videoId;
    // const existingSong = await SongSchema.findOne({ videoId: videoId });
    // if (existingSong) {
    //   return res.status(200).json(existingSong);
    // }

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
