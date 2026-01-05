import Redis from "ioredis";
import { createClient } from "redis";
import { SongVideo } from "../models/Firestore/songVideo";

function cacheKey(song: string, country: string) {
  return `recommends:${encodeURIComponent(song)}|${country}`;
}

async function getCachedSong(song: string, country: string) {
  const redis = new Redis(process.env.REDIS_URL || "string");

  const key = cacheKey(song, country);
  const cachedData = await redis.get(key);
  return cachedData ? JSON.parse(cachedData) : null;
}
async function setCachedSong(song: string, country: string, data: SongVideo) {
  const redis = new Redis(process.env.REDIS_URL || "string");

  console.log("Setting cache for song:", data);
  const key = cacheKey(song, country);
  await redis.set(key, JSON.stringify(data), "EX", 3600); // Cache for 1 hour
}

async function connectRedis() {
  const redis = new Redis(process.env.REDIS_URL || "string");

  try {
    const client = createClient();
    await client.connect();
    console.log("Connected to Redis");
    redis.on("error", (err) => console.error("Redis Client Error", err));
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
}

export { getCachedSong, setCachedSong, connectRedis };
