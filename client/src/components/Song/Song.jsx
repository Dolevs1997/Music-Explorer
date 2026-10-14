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
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "../Button/Button";
import toast from "react-hot-toast";
import UserContext from "../../Contexts/UserContext";
import { addSongToHistory } from "../../utils/userActivity";

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

function Song({
  song,
  country = "US",
  playingVideoId,
  setPlayingVideoId,
  onRemoveSong,
}) {
  const songDetails = getSongDetails(song);
  const [playlistName, setPlaylistName] = useState("");
  const [state, dispatch] = useReducer(reducer, initialSong);
  const [menuPlaylistsOpen, setMenuPlaylistsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const remove = useContext(removeBtn);
  const { user, setUser } = useContext(UserContext);
  const playlists = user?.playlists || [];
  const storedVideoId = typeof song === "object" ? song?.videoId : null;

  async function handlePlaySong() {
    if (!user?._id) return;

    try {
      await addSongToHistory(user, {
        videoId: state.videoId,
        song: state.song,
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
            regionCode: country,
            playlists: [],
          },
        });
        return;
      }

      try {
        const excludedIds = Array.from(globalUsedVideoIds);
        const data = await fetchSongYT(songDetails, country, excludedIds);

        if (!data?.videoId) {
          throw new Error("Song video could not be fetched.");
        }

        globalUsedVideoIds.add(data.videoId);
        if (!isCancelled) {
          dispatch({
            type: "SET_VIDEO_SONG",
            payload: {
              videoId: data.videoId,
              regionCode: data.regionCode,
              song: data.song || songDetails,
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
  }, [songDetails, storedVideoId, country]);

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
    <div className="homeContainer">
      <div className={styles.menuContainer}>
        <button
          type="button"
          className={styles.optionsBtn}
          onClick={() =>
            remove
              ? handleRemoveSongFromPlaylist(state.videoId, remove.playlistId)
              : setMenuPlaylistsOpen((isOpen) => !isOpen)
          }
          aria-label="Options"
        >
          {state.videoId && (
            <>
              {!remove ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="35px"
                  viewBox="0 -960 960 960"
                  width="35px"
                  fill="#e3e3e3"
                >
                  <path d="M120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Zm520 480v-160H480v-80h160v-160h80v160h160v80H720v160h-80Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="35px"
                  viewBox="0 -960 960 960"
                  width="35px"
                  fill="#e3e3e3"
                >
                  <path d="m576-80-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104L576-80ZM120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Z" />
                </svg>
              )}
            </>
          )}
        </button>
      </div>

      {menuPlaylistsOpen && (
        <ListGroup>
          {playlists.map((playlist) => (
            <ListGroup.Item
              action
              key={playlist._id || playlist.id || playlist.name}
              onClick={() => handleAddSongToPlaylist(playlist)}
            >
              {playlist.name}
            </ListGroup.Item>
          ))}
          <ListGroup.Item action onClick={() => setShowModal(true)}>
            Create New Playlist
          </ListGroup.Item>
          {showModal && (
            <div className="modalOverlay">
              <Modal.Dialog style={{ marginTop: "20px" }}>
                <Modal.Body>Enter Playlist Name:</Modal.Body>
                <Form.Control
                  type="text"
                  placeholder="Playlist Name"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                />
                <Modal.Footer>
                  <div className="modalActions">
                    <Button onClick={() => setShowModal(false)} type="close">
                      Close
                    </Button>
                    <Button onClick={handleCreatePlaylist} type="submit">
                      Save changes
                    </Button>
                  </div>
                </Modal.Footer>
              </Modal.Dialog>
            </div>
          )}
        </ListGroup>
      )}
      {state.videoId && (
        <span className={styles.songDetails}>{songDetails}</span>
      )}
      {state.videoId &&
        // lazy-mount player only for the active/playing song to avoid multiple iframe loads
        (playingVideoId === state.videoId ? (
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
          // lightweight preview: thumbnail + play button
          <div>
            <img
              src={`https://img.youtube.com/vi/${state.videoId}/hqdefault.jpg`}
              alt={state.song}
              className={styles.thumbnail}
              loading="lazy"
              onClick={() => {
                setPlayingVideoId?.(state.videoId);
              }}
            />
          </div>
        ))}
    </div>
  );
}

Song.propTypes = {
  song: propTypes.oneOfType([
    propTypes.string,
    propTypes.shape({
      song: propTypes.string,
      songDetail: propTypes.string,
      artists: propTypes.string,
      title: propTypes.string,
      videoId: propTypes.string,
    }),
  ]).isRequired,
  country: propTypes.string,
  playingVideoId: propTypes.string,
  setPlayingVideoId: propTypes.func,
  playlistId: propTypes.string,
  onRemoveSong: propTypes.func,
};

export default Song;
