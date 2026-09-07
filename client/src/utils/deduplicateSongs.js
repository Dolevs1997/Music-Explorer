/**
 * Removes duplicate songs from an array of song names
 * @param {string[]} songs - Array of song names/strings
 * @returns {string[]} Array with duplicates removed, preserving order
 */
function deduplicateSongs(songs) {
  if (!Array.isArray(songs)) return [];
  const seenSongs = new Set();
  return songs.filter((song) => {
    console.log("deduplicateSongs processing song:", song); // Log the song being processed
    const normalizedTitle = song?.title?.trim()?.toLowerCase();
    const normalizedArtist = song?.artists?.trim()?.toLowerCase();
    if (
      !normalizedTitle ||
      !normalizedArtist ||
      seenSongs.has(normalizedArtist + " - " + normalizedTitle)
    ) {
      return false;
    }
    seenSongs.add(normalizedArtist + " - " + normalizedTitle);
    return true;
  });
}

export { deduplicateSongs };
