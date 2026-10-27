import Song from "../Song/Song";
import { useMemo } from "react";
import propTypes from "prop-types";
import styles from "./Songs.module.css";
import { normalizeSong } from "../../utils/normalizeSong";
import { usePlayerStore } from "../../hooks/usePlayerStore";
import { useResolvedSongs } from "../../hooks/useResolvedSongs";
import { useLocation } from "react-router-dom";

function Songs({ songSuggestions, country, onRemoveSong }) {
  const normalizedSongs = useMemo(
    () => songSuggestions.map(normalizeSong),
    [songSuggestions],
  );
  const { songs } = useResolvedSongs(normalizedSongs, country);
  const playPlaylist = usePlayerStore((s) => s.playPlaylist);
  const location = useLocation();
  const source = {
    pathname: location.pathname,
    search: location.search,
    state: location.state,
  }; // console.log("pathName: ", pathname);
  // console.log("search: ", search);
  // console.log(localStorage.getItem("user"));
  return (
    <div className={styles.songsList}>
      <div className={styles.songDetails}>
        <div className={styles.columnHeading}>#</div>
        <div className={styles.columnHeading}>Title</div>
        <div className={styles.columnHeading}>Album</div>
        <div className={styles.columnHeading}>Duration</div>
        <div aria-hidden="true"></div>
      </div>
      <div className={styles.borderSection}></div>
      <div className={styles.playlistSongs}>
        {songs.map((song, index) => (
          <Song
            key={index}
            song={song}
            onRemoveSong={onRemoveSong}
            index={index}
            onPlay={() => playPlaylist(songs, index, source)}
          />
        ))}
      </div>
    </div>
  );
}
Songs.propTypes = {
  songSuggestions: propTypes.arrayOf(
    propTypes.oneOfType([
      propTypes.string,
      propTypes.shape({
        song: propTypes.string.isRequired,
        videoId: propTypes.string,
      }),
    ]),
  ).isRequired,
  sourceId: propTypes.string,
  country: propTypes.string,
  onRemoveSong: propTypes.func,
};

export default Songs;
