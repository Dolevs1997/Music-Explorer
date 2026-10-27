import styles from "./Song.module.css";
import { useState, useContext } from "react";
import propTypes from "prop-types";

import toast from "react-hot-toast";
import UserContext from "../../Contexts/UserContext";
import { CirclePlay, SquarePlus, TrashBin } from "@gravity-ui/icons";
import PlaylistMenu from "../PlaylistMenu/PlaylistMenu";
import { removeBtn } from "../../Contexts/RemoveContext";
import { removeSongFromPlaylist } from "../../utils/playlist";
// import { generateImagePlaylist } from "../../services/OpenAI_service";

function Song({ song, onRemoveSong, index, onPlay }) {
  const remove = useContext(removeBtn);
  const [isHover, setIsHover] = useState(false);
  const [menuPlaylistsOpen, setMenuPlaylistsOpen] = useState(false);
  const { user } = useContext(UserContext);
  const playlists = user?.playlists || [];
  const canPlay = Boolean(song.videoId);

  // console.log("song details: ", song);
  // console.log(playlists);

  function formatTime(time) {
    const minutes = time?.minutes;
    const seconds = time?.seconds;

    const paddedMinutes = String(minutes).padStart(2, "0");
    const paddedSeconds = String(seconds).padStart(2, "0");
    return `${paddedMinutes}:${paddedSeconds}`;
  }
  async function handleRemoveSongFromPlaylist(videoId, targetPlaylistId) {
    try {
      if (!user?._id || !targetPlaylistId) {
        toast.error("Unable to remove this song from the playlist.");
        return;
      }

      await removeSongFromPlaylist(videoId, user, targetPlaylistId);
      onRemoveSong?.(song, videoId);
      toast.success("Song removed from playlist");
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      toast.error("Failed to remove song from playlist");
    }
  }

  return (
    <div>
      <div
        className={styles.songContainerBox}
        onMouseOver={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <span className={styles.trackNumber}>
          {isHover ? (
            <CirclePlay
              onClick={canPlay ? onPlay : undefined}
              className={styles.optionsBtn}
              style={{
                opacity: canPlay ? 1 : 0.35,
                cursor: canPlay ? "pointer" : "default",
              }}
            />
          ) : (
            index + 1
          )}
        </span>

        <div className={styles.imageContainer}>
          <img
            src={`https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg`}
            className={styles.thumbnail}
            loading="lazy"
          />
          <div className={styles.songInfo}>
            <span className={styles.songTitle}>{song.title}</span>

            <span className={styles.songArtists}>{song.artists}</span>
          </div>
        </div>

        <div className={styles.album} title={song.album || undefined}>
          {song.album || "—"}
        </div>
        <div className={styles.duration}>
          {formatTime(song.duration) || "—"}
        </div>
        <button
          type="button"
          className={styles.optionsBtn}
          onClick={() =>
            remove
              ? handleRemoveSongFromPlaylist(song.videoId, remove.playlistId)
              : setMenuPlaylistsOpen((isOpen) => !isOpen)
          }
          aria-label={
            remove ? "Remove song from playlist" : "Add song to playlist"
          }
          aria-expanded={!remove && menuPlaylistsOpen}
        >
          {remove ? (
            <TrashBin className={styles.actionIcon} />
          ) : (
            <SquarePlus className={styles.actionIcon} />
          )}
        </button>

        <PlaylistMenu
          menuPlaylistsOpen={menuPlaylistsOpen}
          setMenuPlaylistsOpen={setMenuPlaylistsOpen}
          playlists={playlists}
        />
      </div>
    </div>
  );
}

Song.propTypes = {
  song: propTypes.shape({
    id: propTypes.string,
    query: propTypes.string,
    title: propTypes.string,
    videoId: propTypes.string,
    artists: propTypes.string,
    album: propTypes.string,
    duration: propTypes.shape({
      minutes: propTypes.number,
      seconds: propTypes.number,
    }),
  }),

  onRemoveSong: propTypes.func,
  index: propTypes.number,
  onPlay: propTypes.func,
};

export default Song;
