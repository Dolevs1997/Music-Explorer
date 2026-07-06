import Redis from "ioredis";
import { SongVideo } from "../models/Firestore/songVideo";
import dotenv from "dotenv";
dotenv.config();

interface CachedSong {
  id: string;
  title: string;
  artist: string;
  artists: string;
  album: string;
  thumbnail: string;
  duration: number;
  previewUrl: string;
  spotifyUrl: string;
  youtubeVideoId: string;
  youtubeUrl: string;
  youtubePublishedAt?: string;
}
let redis: Redis;
function cacheKey(song: string, country: string) {
  return `recommends:${encodeURIComponent(song)}|${country}`;
}
function cachePlaylistKey(playlistId: string, country: string) {
  return `playlist:${encodeURIComponent(playlistId)} - ${country}}`;
}
async function getCachedSong(song: string, country: string) {
  const key = cacheKey(song, country);
  const cachedData = await redis.get(key);
  return cachedData ? JSON.parse(cachedData) : null;
}
async function setCachedSong(song: string, country: string, data: SongVideo) {
  const key = cacheKey(song, country);
  await redis.set(key, JSON.stringify(data), "EX", 3600); // Cache for 1 hour
}

async function getCachedSongPlaylist(playlistId: string, country: string) {
  const key = cachePlaylistKey(playlistId, country);
  const cachedData = await redis.get(key);
  return cachedData ? JSON.parse(cachedData) : null;
}

async function setCachedPlaylistSongs(
  playlistId: string,
  country: string,
  data: CachedSong[],
) {
  const key = cachePlaylistKey(playlistId, country);
  await redis.set(key, JSON.stringify(data), "EX", 3600);
}

async function connectRedis() {
  // Single shared connection — not a new one per function call
  let redisUrl = process.env.REDIS_URL as string;
  console.log("Redis URL:", redisUrl);
  redis = new Redis(redisUrl);

  redis.on("error", (err) => console.error("Redis Client Error:", err));
  redis.on("connect", () => console.log("Connected to Redis"));
}

export {
  getCachedSong,
  setCachedSong,
  connectRedis,
  getCachedSongPlaylist,
  setCachedPlaylistSongs,
};
