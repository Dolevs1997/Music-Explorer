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

const SPOTIFY_GENRE_PLAYLISTS: Record<string, string[]> = {
  rock: [
    "37i9dQZF1DWXRqgorJj26U", // Rock Classics
    "37i9dQZF1DX1rVvRgjX59F", // Rock This
    "37i9dQZF1DX4vth7idTQch", // Rock Hard
  ],
  pop: [
    "37i9dQZF1DXcBWIGoYBM5M", // Today's Top Hits
    "37i9dQZF1DX0kbJZpiYdZl", // Hot Hits
    "37i9dQZF1DXbLMw3sSML5k", // Pop Right Now
  ],
  "hip hop": [
    "37i9dQZF1DX0XUsuxWHRQd", // RapCaviar
    "37i9dQZF1DX2RxBh64BHjQ", // Most Necessary
    "37i9dQZF1DXdBHPWfUtAou", // Hip Hop Central
  ],
  jazz: [
    "37i9dQZF1DX7YCknf2jT6s", // Jazz Classics
    "37i9dQZF1DXbITWG1ZJKYt", // Jazz Vibes
    "37i9dQZF1DX4WYpdgoIcn6", // Peaceful Jazz
  ],
  classical: [
    "37i9dQZF1DWWEJlAGA9gs0", // Classical Essentials
    "37i9dQZF1DX7K31D69s4M1", // Classical Focus
    "37i9dQZF1DXd0MaPlace7mQ", // Classical Mood
  ],
  electronic: [
    "37i9dQZF1DX4dyzvuaRJ0n", // mint
    "37i9dQZF1DXa8NOjJkHPKA", // Electronic Rising
    "37i9dQZF1DX6J75NktzAJR", // Dance Hits
  ],
  metal: [
    "37i9dQZF1DWWOaP4H0w5b0", // Metal Essentials
    "37i9dQZF1DX9qNs32fujYe", // Headbangers
    "37i9dQZF1DX1VCSCQKcbZJ", // Heavy Queens
  ],
  country: [
    "37i9dQZF1DX1lVhptIYRda", // Hot Country
    "37i9dQZF1DX13ZzXoot6Jc", // Country Classics
    "37i9dQZF1DX5gQonLbZD9s", // Country Gold
  ],
  latin: [
    "37i9dQZF1DX10zKzsJ2jva", // Viva Latino
    "37i9dQZF1DX4bLzbFx2KND", // Latin Pop Rising
    "37i9dQZF1DXbmD8tFKnAUq", // Latin Hits
  ],
  reggae: [
    "37i9dQZF1DXan38dNVDdl4", // Reggae Classics
    "37i9dQZF1DX2Nc3B70tvx0", // Reggae Hits
  ],
  blues: [
    "37i9dQZF1DXd9rSDyQguIk", // Blues Classics
    "37i9dQZF1DXbDqXaMdIgS0", // Blues Rock
  ],
  soul: [
    "37i9dQZF1DWTx0xog3gB3q", // Soul Classics
    "37i9dQZF1DX2yvmlOdMYzV", // Soul Coffee
  ],
  funk: [
    "37i9dQZF1DX1N1dODjkxCw", // Funk Classics
    "37i9dQZF1DWWvhKV4FBciw", // Funk & Soul
  ],
  "r&b": [
    "37i9dQZF1DX4SBhb3fqCJd", // Are & Be
    "37i9dQZF1DX0h0QhwldIlP", // R&B Hits
  ],
};

// Resolve which genre keywords match a given category name
function resolveGenreIds(categoryName: string): string[] | null {
  const lower = categoryName.toLowerCase();

  // Exact match first
  if (SPOTIFY_GENRE_PLAYLISTS[lower]) return SPOTIFY_GENRE_PLAYLISTS[lower];

  // Partial match — e.g. "hard rock" matches "rock"
  for (const [key, ids] of Object.entries(SPOTIFY_GENRE_PLAYLISTS)) {
    if (lower.includes(key) || key.includes(lower)) return ids;
  }

  return null; // No match — will fall back to search
}

async function fetchPlaylists(
  playlistName: string,
  country: string = "US",
  location: string = "United States",
  spotifyToken: string,
): Promise<any[]> {
  const genreIds = resolveGenreIds(playlistName);

  let results: any[] = [];

  // Always search for localized playlists first
  const searchResults = await fetchSpotifyPlaylistsBySearch(
    playlistName,
    country,
    location,
    spotifyToken,
  );
  results = [...searchResults];

  if (genreIds) {
    // ── Option 2: hardcoded editorial playlists ────────────────────────────
    const hardcodedResults = await fetchSpotifyPlaylistsByIds(
      genreIds,
      country,
      spotifyToken,
    );

    // Add hardcoded playlists that aren't already in the results
    const existingIds = new Set(results.map((r) => r.id));
    for (const p of hardcodedResults) {
      if (!existingIds.has(p.id)) {
        results.push(p);
      }
    }
  }

  return results;
}

// Fetch specific playlists by their Spotify IDs
async function fetchSpotifyPlaylistsByIds(
  ids: string[],
  country: string,
  token: string,
): Promise<any[]> {
  const fetchPromises = ids.map((id) => {
    return fetch(
      `https://api.spotify.com/v1/playlists/${id}?market=${country}&fields=id,name,description,images,owner,tracks.total`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((res) => res.json())
      .catch(() => null);
  });

  const results = await Promise.all(fetchPromises);

  return results
    .filter((p) => p && !p.error && p.id)
    .map((p) => ({
      id: p.id,
      title: p.name,
      description: p.description || "",
      thumbnail: p.images?.[0]?.url || "",
      owner: p.owner?.display_name || "Spotify",
      totalTracks: p.tracks?.total || 0,
    }));
}

// Search Spotify for playlists matching the genre name
async function fetchSpotifyPlaylistsBySearch(
  genre: string,
  country: string,
  location: string,
  token: string,
): Promise<any[]> {
  const queries = [
    `${location} ${genre}`,
    `best ${genre} hits ${location}`,
    `top ${genre} ${location}`,
    `${genre} playlist ${new Date().getFullYear()}`,
  ];

  const fetchPromises = queries.map((q) =>
    fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=playlist&market=${country}&limit=50`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
      .then((res) => res.json())
      .catch(() => ({ playlists: { items: [] } })),
  );

  const results = await Promise.all(fetchPromises);
  const unique = new Map<string, any>();
  const genreLower = genre.toLowerCase();

  results.forEach((data) => {
    data?.playlists?.items?.forEach((playlist: any) => {
      if (!playlist?.id || unique.has(playlist.id)) return;

      // Basic relevance filter — skip if genre not mentioned anywhere
      const title = (playlist.name || "").toLowerCase();
      const description = (playlist.description || "").toLowerCase();
      if (!title.includes(genreLower) && !description.includes(genreLower))
        return;

      unique.set(playlist.id, {
        id: playlist.id,
        title: playlist.name,
        description: playlist.description || "",
        thumbnail: playlist.images?.[0]?.url || "",
        owner: playlist.owner?.display_name || "",
        totalTracks: playlist.tracks?.total || 0,
      });
    });
  });

  return Array.from(unique.values());
}
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
    `${song} audio`,
  )}&type=video&key=${API_KEY}`;
  try {
    const response = await fetch(url, { signal });
    const data = await response.json();
    if (!data || !data.items || data.items.length === 0) {
      throw new Error("No videos found for the given artist and songName");
    }

    // Find first search result that actually contains a videoId
    const itemWithVideo = data.items.find(
      (it: any) => it && it.id && it.id.videoId,
    );

    if (itemWithVideo) {
      const videoId = itemWithVideo.id.videoId;
      const title = itemWithVideo.snippet?.title ?? "";
      if (!videoId || !title) {
        throw new Error("No videos with videoId found for the given query");
      }
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

async function fetchPlaylistSongs(
  playlistId: string,
  country: string = "US",
  spotifyToken: string,
): Promise<any[]> {
  if (!playlistId) throw new Error("Playlist ID is required");
  if (!spotifyToken) throw new Error("Spotify token is required");
  // Check cache first
  const cached = await getCachedSongPlaylist(playlistId, country);
  if (cached) return cached;

  try {
    // Spotify returns max 100 tracks per request
    // We use offset pagination to get all tracks
    let tracks: any[] = [];
    let offset = 0;
    const limit = 50;
    let total = Infinity;
    const uniqueTrackIds = new Set<string>();

    while (tracks.length < total) {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=${country}&limit=${limit}&offset=${offset}&fields=total,items(track(id,name,artists,album(name,images),duration_ms,preview_url,external_urls))`,
        { headers: { Authorization: `Bearer ${spotifyToken}` } },
      );

      if (!response.ok) {
        console.log("response:", response);
        const errorData = await response.json();
        console.error(
          `Spotify API error fetching playlist songs: ${response.status} ${response.statusText}`,
          errorData,
        );
        throw new Error(
          `Spotify API error: ${errorData.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();

      total = data.total;
      const pageTracks = data.items
        .filter((item: any) => {
          console.log("item:", item);
          if (uniqueTrackIds.has(item?.track.id)) return false;
          uniqueTrackIds.add(item?.track.id);

          // Skip null tracks (can happen with local files or removed tracks)
          if (!item?.track) return false;
          if (!item.track.id) return false;
          // Skip tracks with no name
          if (!item.track.name?.trim()) return false;

          return true;
        })
        .map((item: any) => ({
          id: item.track.id,
          title: item.track.name,
          artist: item.track.artists?.[0]?.name || "Unknown Artist",
          artists: item.track.artists?.map((a: any) => a.name).join(", "),
          album: item.track.album?.name || "",
          thumbnail: item.track.album?.images?.[0]?.url || "",
          duration: item.track.duration_ms,
          previewUrl: item.track.preview_url,
          spotifyUrl: item.track.external_urls?.spotify || "",
          // This is what Song.jsx will use to search YouTube for playback
          searchQuery: `${item.track.artists?.[0]?.name} - ${item.track.name}`,
        }));

      tracks = [...tracks, ...pageTracks];
      offset += limit;

      // Stop if we've fetched everything or reached 200 tracks max
      if (pageTracks.length < limit || tracks.length >= 200) break;
    }

    // Cache the result
    await setCachedPlaylistSongs(playlistId, country, tracks);

    return tracks;
  } catch (error) {
    console.error("fetchPlaylistSongs error:", error);
    throw new Error("Failed to fetch playlist songs");
  }
}
export { fetchPlaylists, fetchPlaylistSongs, fetchSong };
