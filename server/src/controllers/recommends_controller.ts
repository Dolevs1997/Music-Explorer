import SongSchema from "../schemas/Song_schema";
import { fetchSong } from "../services/YouTube_service";
import { Request, Response } from "express";

const getAll = async (req: Request, res: Response) => {
  const song = req.query?.song as string;
  const country = (req.query?.country || "US") as string;
  const excludedVideoIdsParam = req.query?.excludedVideoIds as
    | string
    | string[];
  const excludedVideoIds = Array.isArray(excludedVideoIdsParam)
    ? excludedVideoIdsParam
    : typeof excludedVideoIdsParam === "string"
      ? excludedVideoIdsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];
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

const getBatch = async (req: Request, res: Response) => {
  const songs = req.body?.songs;
  const country = (req.body?.country || "US") as string;
  const excludedVideoIds = new Set<string>(req.body?.excludedVideoIds || []);

  if (!Array.isArray(songs) || songs.length === 0) {
    return res.status(400).json({ error: "Songs must be a non-empty array" });
  }

  try {
    const results: { song: string; videoId: string; regionCode: string }[] = [];
    for (const song of songs) {
      if (typeof song !== "string" || !song.trim()) continue;

      const songData = await fetchSong(song, country, [...excludedVideoIds]);
      if (!songData?.videoId || excludedVideoIds.has(songData.videoId)) {
        continue;
      }

      excludedVideoIds.add(songData.videoId);
      results.push({
        song: songData.title,
        videoId: songData.videoId,
        regionCode: country,
      });
    }

    return res.status(200).json(results);
  } catch (err: Error | any) {
    return res.status(400).json({ error: err.message });
  }
};

export default { getAll, getBatch };
