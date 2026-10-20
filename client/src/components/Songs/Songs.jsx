import Song from "../Song/Song";
import { useState } from "react";
import propTypes from "prop-types";
import styles from "./Songs.module.css";
function Songs({ songSuggestions, onRemoveSong }) {
  const [playingVideoId, setPlayingVideoId] = useState(null);

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
        {songSuggestions.map((song, index) => (
          <Song
            key={song?.videoId || `${song?.song || song?.title || song}-${index}`}
            song={song}
            playingVideoId={playingVideoId}
            setPlayingVideoId={setPlayingVideoId}
            onRemoveSong={onRemoveSong}
            index={index}
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
  onRemoveSong: propTypes.func,
};

export default Songs;
