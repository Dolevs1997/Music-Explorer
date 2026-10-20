import styles from "./Song.module.css";
import { useState, useEffect, useReducer, useContext } from "react";
import YouTube from "react-youtube";
import propTypes from "prop-types";
import { fetchSongYT } from "../../services/YouTube_service";
import {
  addSongToPlaylist,
  removeSongFromPlaylist,
  createPlaylist,
} from "../../utils/playlist";
import { removeBtn } from "../../Contexts/RemoveContext";
import toast from "react-hot-toast";
import UserContext from "../../Contexts/UserContext";
import { addSongToHistory } from "../../utils/userActivity";
import { SquarePlus, TrashBin } from "@gravity-ui/icons";
import { parse } from "iso8601-duration";
// import { generateImagePlaylist } from "../../services/OpenAI_service";
const opts = {
  height: "200",
  width: "200",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1, // Don't autoplay on mobile (battery/data)
    controls: 1, // ✅ Show controls (important!)
    modestbranding: 0, // Show full YouTube branding
    rel: 0, // Don't suggest other videos
    showinfo: 1,
    iv_load_policy: 3, // Hide annotations
    fs: 1, // Allow fullscreen
    playsinline: 1, // ✅ CRITICAL for iOS - plays inline instead of fullscreen

    color: "white",
  },
};
const initialSong = {
  videoId: "",
  song: "",
  duration: undefined,
  regionCode: "",
  loading: true,
  error: null,
  playlists: [],
  playing: false,
};
// let render = 0;
function reducer(state, action) {
  switch (action.type) {
    case "LOADING_SONG":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "SET_VIDEO_SONG":
      return {
        ...state,
        videoId: action.payload.videoId,
        song: action.payload.song,
        duration: action.payload.duration,
        regionCode: action.payload.regionCode,
        loading: false,
      };
    case "SET_IN_PLAYLIST":
      return {
        ...state,
        playlists: action.payload.playlists,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload.error,
        loading: false,
      };
    case "PLAY":
      return { ...state, playing: true };
    case "PAUSE":
      return { ...state, playing: false };

    default:
      return state;
  }
}
const globalUsedVideoIds = new Set();

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

function Song({
  song,
  country = "US",
  playingVideoId,
  setPlayingVideoId,
  onRemoveSong,
  index,
}) {
  const songDetails = getSongDetails(song);
  const { title: songTitle, artists: songArtists } = getSongDisplayInfo(song);
  const songAlbum =
    typeof song === "object" && song !== null
      ? typeof song.album === "string"
        ? song.album
        : song.album?.name || song.album?.title || song.albumName || ""
      : "";
  const [playlistName, setPlaylistName] = useState("");
  const [state, dispatch] = useReducer(reducer, initialSong);
  const [menuPlaylistsOpen, setMenuPlaylistsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const remove = useContext(removeBtn);
  const { user, setUser } = useContext(UserContext);
  const playlists = user?.playlists || [];
  const storedVideoId = typeof song === "object" ? song?.videoId : null;
  // console.log("song details: ", songDetails);
  async function handlePlaySong() {
    if (!user?._id) return;

    try {
      await addSongToHistory(user, {
        videoId: state.videoId,
        song: state.song,
        duration: state.duration,
        regionCode: state.regionCode,
      });
    } catch (error) {
      console.error("Error adding song to listening history:", error);
      toast.error("Could not save this song to your listening history.");
    }
  }
  async function handleAddSongToPlaylist(playlist) {
    try {
      if (!user?._id) {
        toast.error("Please sign in to add songs to a playlist.");
        return;
      }

      const response = await addSongToPlaylist(
        songDetails,
        state,
        user,
        playlist,
      );
      const data = response.data;
      const addedSong = data?.playlist?.songs?.at(-1);

      if (!data?.playlist || !addedSong) {
        throw new Error("The server returned an invalid playlist response.");
      }

      dispatch({
        type: "SET_IN_PLAYLIST",
        payload: {
          videoId: state.videoId,
          song: state.song,
          playlists: [data.playlist.name],
        },
      });

      const updatedUser = {
        ...user,
        playlists: playlists.map((existingPlaylist) =>
          existingPlaylist._id === playlist._id
            ? {
                ...existingPlaylist,
                songs: [...(existingPlaylist.songs || []), addedSong],
              }
            : existingPlaylist,
        ),
      };

      const playlistExists = playlists.some(
        (existingPlaylist) =>
          existingPlaylist._id === data.playlist._id ||
          existingPlaylist.name === data.playlist.name,
      );
      if (!playlistExists) {
        updatedUser.playlists = [...updatedUser.playlists, data.playlist];
      }

      setUser(updatedUser);
      setMenuPlaylistsOpen(false);
      toast.success(data.message || "Song added to playlist.");
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      toast.error("Failed to add song to playlist.");
    } finally {
      setPlaylistName("");
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadSong() {
      dispatch({ type: "LOADING_SONG" });

      if (!songDetails) {
        dispatch({
          type: "SET_ERROR",
          payload: { error: "Song details are missing." },
        });
        return;
      }

      if (storedVideoId) {
        dispatch({
          type: "SET_VIDEO_SONG",
          payload: {
            videoId: storedVideoId,
            song: songDetails,
            duration: song?.duration,
            regionCode: country,
            playlists: [],
          },
        });
        return;
      }

      try {
        const excludedIds = Array.from(globalUsedVideoIds);
        const data = await fetchSongYT(songDetails, country, excludedIds);
        console.log("song fetched: ", data);
        if (!data?.videoId) {
          throw new Error("Song video could not be fetched.");
        }
        const durationObj = data?.duration;
        const obj = durationObj ? parse(durationObj) : null;
        const totalSeconds =
          (obj.days ?? 0) * 86400 +
          (obj.hours ?? 0) * 3600 +
          (obj.minutes ?? 0) * 60 +
          (obj.seconds ?? 0);
        const duration = `${Math.floor(totalSeconds / 60)}:${String(
          totalSeconds % 60,
        ).padStart(2, "0")}`;
        globalUsedVideoIds.add(data.videoId);
        if (!isCancelled) {
          dispatch({
            type: "SET_VIDEO_SONG",
            payload: {
              videoId: data.videoId,
              regionCode: data.regionCode,
              song: data.song || songDetails,
              duration: duration,
              playlists: [],
            },
          });
        }
      } catch (error) {
        console.error("Error fetching song:", error);
        if (!isCancelled) {
          dispatch({
            type: "SET_ERROR",
            payload: { error: "Failed to load this song." },
          });
        }
      }
    }

    loadSong();
    return () => {
      isCancelled = true;
    };
  }, [songDetails, song?.duration, storedVideoId, country]);

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

  async function handleCreatePlaylist() {
    const trimmedPlaylistName = playlistName.trim();
    if (!trimmedPlaylistName) {
      toast.error("Enter a playlist name.");
      return;
    }

    try {
      if (!user?._id) {
        toast.error("Please sign in to create a playlist.");
        return;
      }

      const response = await createPlaylist(trimmedPlaylistName, user);
      const newPlaylist = response.data?.playlist;
      if (!newPlaylist) {
        throw new Error("The server did not return the created playlist.");
      }

      await handleAddSongToPlaylist(newPlaylist);
      setShowModal(false);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist. Please try again.");
    }
  }

  if (state.error) {
    return <p role="alert">{state.error}</p>;
  }

  if (state.loading || !state.videoId) {
    return null;
  }

  return (
    <div>
      {state.videoId && (
        <div className={styles.songContainerBox}>
          <span className={styles.trackNumber}>{index + 1}</span>
          {playingVideoId === state.videoId ? (
            <YouTube
              videoId={state.videoId}
              title={state.song}
              opts={opts}
              onPlay={handlePlaySong}
              onPause={() => {
                dispatch({ type: "PAUSE", payload: { playing: false } });
              }}
            />
          ) : (
            <div className={styles.imageContainer}>
              <img
                src={`https://img.youtube.com/vi/${state.videoId}/hqdefault.jpg`}
                alt={songTitle || state.song}
                className={styles.thumbnail}
                loading="lazy"
                onClick={() => {
                  setPlayingVideoId?.(state.videoId);
                }}
              />
              <div className={styles.songInfo}>
                <h4 className={styles.songTitle}>{songTitle || state.song}</h4>
                {songArtists && (
                  <h7 className={styles.songArtists}>{songArtists}</h7>
                )}
              </div>
            </div>
          )}
          <div className={styles.album} title={songAlbum || undefined}>
            {songAlbum || "—"}
          </div>
          <div className={styles.duration}>{state.duration || "—"}</div>
          <div
            className={`${styles.menuContainer} ${
              menuPlaylistsOpen ? styles.menuContainerOpen : ""
            }`}
          >
            <button
              type="button"
              className={styles.optionsBtn}
              onClick={() =>
                remove
                  ? handleRemoveSongFromPlaylist(
                      state.videoId,
                      remove.playlistId,
                    )
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
            {!remove && menuPlaylistsOpen && (
              <div className={styles.playlistMenu} role="menu">
                <div className={styles.menuHeader}>
                  <div>
                    <span className={styles.menuEyebrow}>YOUR LIBRARY</span>
                    <h3 className={styles.menuTitle}>Save to playlist</h3>
                  </div>
                  <button
                    type="button"
                    className={styles.closeMenuButton}
                    onClick={() => setMenuPlaylistsOpen(false)}
                    aria-label="Close playlist menu"
                  >
                    ×
                  </button>
                </div>
                <div className={styles.playlistList}>
                  {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                      <button
                        type="button"
                        className={styles.playlistOption}
                        key={playlist._id || playlist.id || playlist.name}
                        role="menuitem"
                        onClick={() => handleAddSongToPlaylist(playlist)}
                      >
                        <span className={styles.playlistArtwork} aria-hidden>
                          ♪
                        </span>
                        <span className={styles.playlistOptionName}>
                          {playlist.name}
                        </span>
                        <span
                          className={styles.playlistOptionArrow}
                          aria-hidden
                        >
                          →
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className={styles.emptyPlaylists}>
                      Your playlists will show up here.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.createPlaylistButton}
                  onClick={() => {
                    setMenuPlaylistsOpen(false);
                    setShowModal(true);
                  }}
                >
                  <span className={styles.createPlaylistPlus} aria-hidden>
                    +
                  </span>
                  Create new playlist
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <section
            className={styles.playlistDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-playlist-title"
          >
            <div className={styles.dialogArtwork} aria-hidden>
              ♪
            </div>
            <span className={styles.menuEyebrow}>MAKE IT YOURS</span>
            <h2 id="create-playlist-title" className={styles.dialogTitle}>
              Create a playlist
            </h2>
            <p className={styles.dialogDescription}>
              Give your new collection a name. We’ll add this song to it.
            </p>
            <form
              className={styles.playlistForm}
              onSubmit={(event) => {
                event.preventDefault();
                handleCreatePlaylist();
              }}
            >
              <label
                className={styles.playlistInputLabel}
                htmlFor="playlist-name"
              >
                Playlist name
              </label>
              <input
                id="playlist-name"
                className={styles.playlistInput}
                type="text"
                placeholder="e.g. Late night discoveries"
                value={playlistName}
                onChange={(event) => setPlaylistName(event.target.value)}
                autoFocus
              />
              <div className={styles.dialogActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.savePlaylistButton}>
                  Create playlist
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

Song.propTypes = {
  song: propTypes.oneOfType([
    propTypes.string,
    propTypes.shape({
      song: propTypes.string,
      songDetail: propTypes.string,
      artists: propTypes.oneOfType([
        propTypes.string,
        propTypes.arrayOf(
          propTypes.oneOfType([
            propTypes.string,
            propTypes.shape({ name: propTypes.string }),
          ]),
        ),
      ]),
      title: propTypes.string,
      videoId: propTypes.string,
    }),
  ]).isRequired,
  country: propTypes.string,
  playingVideoId: propTypes.string,
  setPlayingVideoId: propTypes.func,
  playlistId: propTypes.string,
  onRemoveSong: propTypes.func,
  index: propTypes.number,
};

export default Song;
