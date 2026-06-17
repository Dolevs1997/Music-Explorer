/**
 * Removes duplicate songs from an array of song names
 * @param {string[]} songs - Array of song names/strings
 * @returns {string[]} Array with duplicates removed, preserving order
 */
function deduplicateSongs(songs) {
  if (!Array.isArray(songs)) return [];

  const seenSongs = new Set();
  return songs.filter((song) => {
    const normalized = song?.trim().toLowerCase();
    if (!normalized || seenSongs.has(normalized)) {
      return false;
    }
    seenSongs.add(normalized);
    return true;
  });
}

export { deduplicateSongs };
