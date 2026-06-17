import Song from "../Song/Song";
import { useState, useCallback } from "react";
import propTypes from "prop-types";

function Songs({ songSuggestions, onRemoveSong }) {
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [renderedVideoIds, setRenderedVideoIds] = useState(new Set());

  // Callback for Song components to register their videoId
  const registerVideoId = useCallback((videoId) => {
    setRenderedVideoIds((prev) => new Set(prev).add(videoId));
  }, []);

  // Check if a videoId is a duplicate
  const isVideoDuplicate = useCallback((videoId) => {
    return renderedVideoIds.has(videoId);
  }, [renderedVideoIds]);

  return (
    <div>
      <h2>Song Results</h2>
      {songSuggestions.length > 1 ? (
        <div className="homeContainer">
          <ul>
            {songSuggestions.map((song) => (
              <li key={song}>
                <Song
                  key={song}
                  song={song}
                  playingVideoId={playingVideoId}
                  setPlayingVideoId={setPlayingVideoId}
                  onRemoveSong={onRemoveSong}
                  registerVideoId={registerVideoId}
                  isVideoDuplicate={isVideoDuplicate}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="homeContainer">
          <Song
            song={songSuggestions[0]}
            playingVideoId={playingVideoId}
            setPlayingVideoId={setPlayingVideoId}
            onRemoveSong={onRemoveSong}
            registerVideoId={registerVideoId}
            isVideoDuplicate={isVideoDuplicate}
          />
        </div>
      )}
    </div>
  );
}
Songs.propTypes = {
  songSuggestions: propTypes.arrayOf(propTypes.string.isRequired).isRequired,
  onRemoveSong: propTypes.func.isRequired,
};

export default Songs;
