import Song from "../Song/Song";
import styles from "./Songs.module.css";
import { useState } from "react";
import propTypes from "prop-types";

function Songs({ songSuggestions, user, onRemoveSong }) {
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [playbackPositions, setPlaybackPositions] = useState({});
  return (
    <div>
      {songSuggestions.length >= 1 ? (
        <div className={styles.boxSongs}>
          <h2>Song Suggestions</h2>
          <ul>
            {songSuggestions.map((song) => (
              <Song
                key={song}
                song={song}
                user={user}
                playingVideoId={playingVideoId}
                setPlayingVideoId={setPlayingVideoId}
                playbackPositions={playbackPositions}
                setPlaybackPositions={setPlaybackPositions}
                onRemoveSong={onRemoveSong}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className={styles.boxSongs}>
          <h2>Song Record Audio</h2>
          <Song
            song={songSuggestions[0]}
            user={user}
            playingVideoId={playingVideoId}
            setPlayingVideoId={setPlayingVideoId}
            playbackPositions={playbackPositions}
            setPlaybackPositions={setPlaybackPositions}
            onRemoveSong={onRemoveSong}
          />
        </div>
      )}
    </div>
  );
}
Songs.propTypes = {
  songSuggestions: propTypes.arrayOf(propTypes.string.isRequired).isRequired,
  user: propTypes.shape({
    token: propTypes.string.isRequired,
    playlists: propTypes.arrayOf(
      propTypes.shape({
        _id: propTypes.string,
        name: propTypes.string,
      })
    ),
  }).isRequired,
  onRemoveSong: propTypes.func.isRequired,
};

export default Songs;
