import {
  fetchPlaylists,
  fetchPlaylistSongs,
} from "../services/YouTube_service";
import { Request, Response } from "express";
const getAll = async (req: Request, res: Response) => {
  const token = req.headers["spotify-token"];
  if (!token) {
    return res.status(400).json({ error: "No Spotify token provided" });
  }

  const result = await fetch(
    `https://api.spotify.com/v1/browse/categories?limit=${req.query.limit}&locale=${req.query.locale}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );
  const data = await result.json();

  res.status(200).json(data);
};

const getById = async (req: Request, res: Response) => {
  const name = req.query.name;
  const country = req.query.country || "US";
  const locationName = req.query.location || "United States";
  if (!name) {
    return res
      .status(400)
      .json({ error: "Please provide name in query params" });
  }
  const result = await fetchPlaylists(
    name as string,
    country as string,
    locationName as string,
  );
  if (!result) {
    return res.status(400).json({ error: "No playlists found" });
  }
  res.status(200).json(result);
};

const getPlaylistSongs = async (req: Request, res: Response) => {
  const playlistId = req.query.id as string;
  const country = req.query.country as string;
  const result = await fetchPlaylistSongs(playlistId, country);
  if (!result) {
    return res.status(400).json({ error: "No playlist songs found" });
  }
  res.status(200).json(result);
};

export default { getAll, getById, getPlaylistSongs };
