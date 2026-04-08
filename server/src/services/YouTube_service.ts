import dotenv from "dotenv";
import {
  getCachedSong,
  setCachedSong,
  getCachedSongPlaylist,
  setCachedPlaylistSongs,
} from "./Redis_service";
dotenv.config();
const API_KEY = process.env.YOUTUBE_API_KEY;

export type YouTubePlaylistItem = {
  id: {
    playlistId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
    publishedAt: string;
    resourceId: {
      kind: string;
      videoId: string;
    };
  };
};

async function fetchSong(song: string, country = "US") {
  const controller = new AbortController();
  const signal = controller.signal;
  const cachedSong = await getCachedSong(song, country);
  if (cachedSong && (cachedSong as any).videoId) {
    // console.log("Returning cached song:", cachedSong);
    return cachedSong;
  }
  // console.log("Fetching song from YouTube API:", song, country);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&regionCode=${country}&q=${encodeURIComponent(
    `${song}`,
  )}&type=video&key=${API_KEY}`;
  try {
    const response = await fetch(url, { signal });
    const data = await response.json();
    // if (!data || !data.items || data.items.length === 0) {
    //   throw new Error("No videos found for the given artist and songName");
    // }

    // Find first search result that actually contains a videoId
    const itemWithVideo = data.items.find(
      (it: any) => it && it.id && it.id.videoId,
    );
    // if (!itemWithVideo) {
    //   throw new Error("No videos with videoId found for the given query");
    // }
    if (itemWithVideo) {
      const videoId = itemWithVideo.id.videoId;
      const title = itemWithVideo.snippet?.title ?? "";

      // Only cache and return if we have a videoId
      await setCachedSong(song, country, {
        title,
        videoId,
      });

      return { title, videoId };
    }
  } catch (error) {
    console.error(
      "YouTube_service file in fetchSong: Error fetching songs:",
      error,
    );
    throw new Error("Failed to fetch songs");
  }
}

async function fetchPlaylists(
  playlistName: string,
  country: string = "US",
  location: string = "United States",
) {
  console.log(
    "Fetching playlists for:",
    playlistName,
    "in",
    location,
    "and country",
    country,
  );
  const controller = new AbortController();
  const signal = controller.signal;
  const queryStr = `top ${playlistName} music playlists for ${location}`;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${queryStr}&regionCode=${country}&type=playlist&key=${API_KEY}`;
  try {
    const response = await fetch(url, { signal });
    const data = await response.json();
    return data.items.map((item: YouTubePlaylistItem) => ({
      id: item.id.playlistId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error(
      "YouTube_service file in fetchPlaylists: Error fetching playlists:",
      error,
    );
    throw new Error("Failed to fetch playlists");
  }
  // if (!response.ok) {
  //   throw new Error(`Error fetching playlists: ${response.statusText}`);
  // }
}

async function fetchPlaylistSongs(playlistId: string, country: string = "") {
  if (!playlistId) {
    throw new Error("Playlist ID is required");
  } else if (country == "") {
    throw new Error("country is required");
  }
  const cachedPlaylistSong = await getCachedSongPlaylist(playlistId, country);
  if (cachedPlaylistSong) {
    // console.log(
    //   "Returning playlist song from CachedSongPlaylist: ",
    //   cachedPlaylistSong
    // );
    return cachedPlaylistSong;
    // return cachedPlaylistSong[0].map((item: YouTubePlaylistItem) => ({
    //   id: item.snippet.resourceId.videoId,
    //   title: item.snippet.title,
    //   publishedAt: item.snippet.publishedAt,
    // }));
    // return;
  }
  console.log("Fetching songs for playlist ID:", playlistId);
  const controller = new AbortController();
  const signal = controller.signal;

  // Fetch playlist items with contentDetails to check video duration
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    console.log(response.json());
    console.error(
      "YouTube_service file in fetchPlaylistSongs: Error fetching playlist songs:",
      response.statusText,
    );
    // throw new Error(`Error fetching playlist songs: ${response.statusText}`);
  }
  const data = await response.json();
  // console.log("Playlist songs data:", data);
  if (!data || !data.items) {
    throw new Error("No playlist songs found");
  }
  const videoIds: string[] = [];
  await setCachedPlaylistSongs(
    playlistId,
    country,
    data.items
      .filter((item: YouTubePlaylistItem) => {
        console.log("item: ", item);
        if (videoIds.includes(item.snippet.resourceId.videoId)) {
          return false;
        }
        // Must be a video
        if (
          item.snippet.resourceId.kind !== "youtube#video" ||
          !item.snippet.resourceId.videoId
        ) {
          return false;
        }
        // Exclude private/deleted videos
        if (
          item.snippet.title === "Deleted video" ||
          item.snippet.title === "Private video"
        )
          return false;

        // console.log("videoIds in playlist: ", videoIds);
        // Exclude videos with unwanted content in title (trailers, clips, reviews, etc.)
        const title = item.snippet.title.toLowerCase();
        const excludePatterns = [
          "trailer",
          "teaser",
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

        videoIds.push(item.snippet.resourceId.videoId);
        return true;
      })
      .map((item: YouTubePlaylistItem) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
      })),
  );
  // Filter to only include actual music videos
  return data.items
    .filter((item: YouTubePlaylistItem) => {
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
    .map((item: YouTubePlaylistItem) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
    }));
}

export { fetchPlaylists, fetchPlaylistSongs, fetchSong };
