export function normalizeSong(raw) {
  const { title, artists } = getSongDisplayInfo(raw);
  return {
    id: raw.videoId || getSongDetails(raw),
    query: getSongDetails(raw),
    title,
    artists,
    album: raw.album?.name ?? raw.album ?? "",
    videoId: raw.videoId ?? null,
    duration: raw.duration ?? null,
  };
}

function getSongDetails(song) {
  if (typeof song === "string") return song.trim();

  return (
    song?.song ||
    song?.songDetail ||
    (song?.artists && song?.title
      ? `${song.artists} - ${song.title}`
      : song?.title || "")
  );
}

function getSongDisplayInfo(song) {
  if (typeof song === "string") {
    return { title: song.trim(), artists: "" };
  }

  const artists = Array.isArray(song?.artists)
    ? song.artists
        .map((artist) => (typeof artist === "string" ? artist : artist?.name))
        .filter(Boolean)
        .join(", ")
    : song?.artists || "";

  return {
    title: song?.title || song?.song || song?.songDetail || "",
    artists,
  };
}
