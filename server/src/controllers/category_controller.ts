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
    `https://api.spotify.com/v1/browse/categories?limit=${req.query.limit}`,
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
  const spotifyToken = req.headers["spotify-token"] as string;

  if (!name) {
    return res
      .status(400)
      .json({ error: "Please provide name in query params" });
  }
  const result = await fetchPlaylists(
    name as string,
    country as string,
    locationName as string,
    spotifyToken,
  );
  if (!result) {
    return res.status(400).json({ error: "No playlists found" });
  }
  res.status(200).json(result);
};

const getPlaylistSongs = async (req: Request, res: Response) => {
  const playlistId = req.query.id as string;
  const country = (req.query.country as string) || "US";
  const spotifyToken = req.headers["spotify-token"] as string;
  if (!playlistId) {
    return res.status(400).json({ error: "Playlist ID is required" });
  }
  if (!spotifyToken) {
    return res.status(400).json({ error: "No Spotify token provided" });
  }

  try {
    const result = await fetchPlaylistSongs(playlistId, country, spotifyToken);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "No songs found in playlist" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching playlist songs:", error);
    res.status(500).json({ error: "Failed to fetch playlist songs" });
  }
};

export default { getAll, getById, getPlaylistSongs };
