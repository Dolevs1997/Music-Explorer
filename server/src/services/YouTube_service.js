const dotenv = require("dotenv");
const { getCachedSong, setCachedSong } = require("./Redis_service");
dotenv.config();
const API_KEY = process.env.YOUTUBE_API_KEY;

async function fetchSong(song, country = "US") {
  const controller = new AbortController();
  const signal = controller.signal;
  const cachedSong = await getCachedSong(song, country);
  if (cachedSong) {
    // console.log("Returning cached song:", cachedSong);
    return cachedSong;
  }
  console.log("Fetching song from YouTube API:", song, country);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&regionCode=${country}&q=${encodeURIComponent(
    `${song}`
  )}&type=video&key=${API_KEY}`;
  try {
    const response = await fetch(url, { signal });
    const data = await response.json();
    // console.log("Video data:", data);
    if (data.items.length === 0) {
      throw new Error("No videos found for the given artist and songName");
    }
    const videoId = data.items[0].id.videoId;
    await setCachedSong(song, country, {
      title: data.items[0].snippet.title,
      videoId: videoId,
    });
    return {
      title: data.items[0].snippet.title,
      videoId: videoId,
    };
  } catch (error) {
    console.error(
      "YouTube_service file in fetchSong: Error fetching songs:",
      error
    );
    throw new Error("Failed to fetch songs");
  }
}

async function fetchPlaylists(
  playlistName,
  country = "US",
  location = "United States"
) {
  console.log(
    "Fetching playlists for:",
    playlistName,
    "in",
    location,
    "and country",
    country
  );
  const controller = new AbortController();
  const signal = controller.signal;
  const queryStr = `${playlistName} music playlists ${location}`;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=23&q=${queryStr}&regionCode=${country}&type=playlist&key=${API_KEY}`;
  try {
    const response = await fetch(url, { signal });
    const data = await response.json();
    return data.items.map((item) => ({
      id: item.id.playlistId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error(
      "YouTube_service file in fetchPlaylists: Error fetching playlists:",
      error
    );
    throw new Error("Failed to fetch playlists");
  }
  // if (!response.ok) {
  //   throw new Error(`Error fetching playlists: ${response.statusText}`);
  // }
}

async function fetchPlaylistSongs(playlistId) {
  if (!playlistId) {
    throw new Error("Playlist ID is required");
  }
  console.log("Fetching songs for playlist ID:", playlistId);
  const controller = new AbortController();
  const signal = controller.signal;

  // Fetch playlist items with contentDetails to check video duration
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    console.error(
      "YouTube_service file in fetchPlaylistSongs: Error fetching playlist songs:",
      response.statusText
    );
    throw new Error(`Error fetching playlist songs: ${response.statusText}`);
  }
  const data = await response.json();
  // console.log("Playlist songs data:", data);
  if (!data || !data.items) {
    throw new Error("No playlist songs found");
  }

  // Filter to only include actual music videos
  return data.items
    .filter((item) => {
      // Must be a video
      if (item.snippet.resourceId.kind !== "youtube#video") return false;

      // Exclude private/deleted videos
      if (
        item.snippet.title === "Deleted video" ||
        item.snippet.title === "Private video"
      )
        return false;

      // Exclude videos with unwanted content in title (trailers, clips, reviews, etc.)
      const title = item.snippet.title.toLowerCase();
      const excludePatterns = [
        "trailer",
        "teaser",
        "official video",
        "lyric video",
        "review",
        "reaction",
        "tutorial",
        "podcast",
        "compilation",
        "mixtape",
        "mix",
      ];

      if (excludePatterns.some((pattern) => title.includes(pattern))) {
        return false;
      }

      return true;
    })
    .map((item) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
    }));
}

module.exports = {
  fetchPlaylists,
  fetchPlaylistSongs,
  fetchSong,
};
