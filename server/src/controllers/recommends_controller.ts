import { fetchSong } from "../services/YouTube_service";
import { Request, Response } from "express";

const getAll = async (req: Request, res: Response) => {
  const song = req.query?.song as string;
  const country = (req.query?.country || "US") as string;

  try {
    if (!song) return res.status(400).json({ error: "Missing song parameter" });
    const songData = await fetchSong(song as string, country as string);
    if (!songData) {
      return res
        .status(404)
        .json({ error: "No unique song data from YouTube" });
    }
    const videoId = songData.videoId;

    return res.status(200).json({
      song: songData.title,
      videoId: videoId,
      duration: songData.duration,
      regionCode: country,
    });
  } catch (err: Error | any) {
    return res.status(400).json({ error: err.message });
  }
};

const getBatch = async (req: Request, res: Response) => {
  const songs = req.body?.songs;
  const country = (req.body?.country || "US") as string;
  if (!Array.isArray(songs) || songs.length === 0) {
    return res.status(400).json({ error: "Songs must be a non-empty array" });
  }
  const results: any[] = new Array(songs.length).fill(null);
  let next = 0;
  async function worker() {
    while (next < songs.length) {
      let i = next++;
      const { query } = songs[i];
      try {
        const data = await fetchSong(query, country);
        results[i] = data?.videoId
          ? {
              query,
              videoId: data.videoId,
              duration: data.duration,
              title: data.title,
              regionCode: country,
            }
          : { query, error: "video not found" };
      } catch {
        results[i] = { query, error: "failed" };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, songs.length) }, worker));
  return res.status(200).json(results);
};

export default { getAll, getBatch };
