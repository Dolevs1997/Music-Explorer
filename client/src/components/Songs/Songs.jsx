import Song from "../Song/Song";
import { useState } from "react";
import propTypes from "prop-types";

function Songs({ songSuggestions, onRemoveSong }) {
  const [playingVideoId, setPlayingVideoId] = useState(null);

  return (
    <div>
      {songSuggestions.length > 1 ? (
        <div className="homeContainer">
          <div className="playlists">
            {songSuggestions.map((song) => (
              <Song
                key={song}
                song={song}
                playingVideoId={playingVideoId}
                setPlayingVideoId={setPlayingVideoId}
                onRemoveSong={onRemoveSong}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="homeContainer">
          <Song
            song={songSuggestions[0]}
            playingVideoId={playingVideoId}
            setPlayingVideoId={setPlayingVideoId}
            onRemoveSong={onRemoveSong}
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
