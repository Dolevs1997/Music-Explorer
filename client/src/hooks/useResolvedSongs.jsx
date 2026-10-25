import { useMemo } from "react";
import { fetchSongsYT } from "../services/YouTube_service";
import { useQuery } from "@tanstack/react-query";
import { parse } from "iso8601-duration";

function isoToSeconds(iso) {
  if (!iso) return null;
  const d = parse(iso);
  // console.log("d: ", d);
  return d;
}

export function useResolvedSongs(songs, country = "US") {
  const missing = [
    ...new Set(songs.filter((song) => !song.videoId).map((song) => song.query)),
  ];
  const { data, isLoading, error } = useQuery({
    queryKey: ["resolved-songs", country, missing],
    queryFn: () =>
      fetchSongsYT(
        missing.map((query) => ({ query })),
        country,
      ),
    enabled: missing.length > 0,
    staleTime: Infinity,
  });

  const resolved = useMemo(() => {
    if (!data) return songs;
    const mapSongQuery = new Map(data.map((song) => [song.query, song]));
    return songs.map((song) => {
      const songQuery = mapSongQuery.get(song.query);
      if (!songQuery?.videoId) return song;
      return {
        ...song,
        videoId: songQuery.videoId,
        duration: isoToSeconds(songQuery.duration) ?? song.duration,
      };
    });
  }, [data, songs]);

  return { songs: resolved, isLoading, error };
}
