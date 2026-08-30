import styles from "./Song.module.css";
import { useState, useEffect, useReducer, useRef, useContext } from "react";
import { useNavigate } from "react-router";
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
import toast, { Toaster } from "react-hot-toast";
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
function Song({
  song,
  country = "US",
  playingVideoId,
  setPlayingVideoId,
  playlistId,
  onRemoveSong,
}) {
  const navigate = useNavigate();
  const songTitle = typeof song === "object" ? song.song : song;
  const storedVideoId = typeof song === "object" ? song.videoId : null;
  const [playlistName, setPlaylistName] = useState("");
  const [state, dispatch] = useReducer(reducer, initialSong);
  const songRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlaylistsOpen, setMenuPlaylistsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const remove = useContext(removeBtn);
  const { user, setUser } = useContext(UserContext);
  const hasFetchedRef = useRef(false); // ← add this ref

  // console.log("song: ", song);
  // console.log("song ref: ", songRef);
  // console.log("song video state: ", state.videoId);
  if (!user.token) {
    navigate("/login");
  }
  if (!user.playlists) {
    user.playlists = [];
    localStorage.setItem("user", JSON.stringify(user));
  }
  if (user.playlists.length === 0) {
    user.playlists = [];
  }
  async function handlePlaySong() {
    await addSongToHistory(user, songRef.current);
    dispatch({ type: "PLAY", payload: { playing: true } });
  }
  async function handleAddSongToPlaylist(playlist) {
    const response = await addSongToPlaylist(song, state, user, playlist);
    if (response.status == 200) toast.success(`${response.data.message}`);
    else if (response.status != 200) toast.error(`${response.data.message}`);
    const data = response.data;

    try {
      dispatch({
        type: "SET_IN_PLAYLIST",
        payload: {
          videoId: state.videoId,
          song: state.song,
          playlists: [data.playlist.name],
        },
      });

      // updating user context with new song
      const updatedUser = {
        ...user,
        playlists: user.playlists.map((p) =>
          p._id == playlist._id
            ? {
                ...p,
                songs: [
                  ...(p.songs || []),
                  data.playlist.songs[data.playlist.songs.length - 1],
                ],
              }
            : p,
        ),
      };

      //checking if playlist already exists
      const playlistExists = user.playlists.some(
        (p) => p._id === data.playlist._id || p.name === data.playlist.name,
      );

      if (!playlistExists) {
        updatedUser.playlists = [...updatedUser.playlists, data.playlist];
      }

      setUser(updatedUser);
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
    setPlaylistName("");
  }

  useEffect(() => {
    async function processQueue() {
      if (!songTitle || !user.token) return;
      if (hasFetchedRef.current) return;
      if (storedVideoId) {
        songRef.current = {
          videoId: storedVideoId,
          song: songTitle,
        };
        dispatch({
          type: "SET_VIDEO_SONG",
          payload: {
            videoId: storedVideoId,
            song: songTitle,
            regionCode: country,
            playlists: [],
          },
        });
        return;
      }
      if (songRef.current && state.videoId === songRef.current.videoId) return;
      if (songRef.current?.videoId) {
        dispatch({
          type: "SET_VIDEO_SONG",
          payload: {
            videoId: songRef.current.videoId,
            regionCode: songRef.current.regionCode,
            song: songRef.current.song,
            playlists: [],
          },
        });
        return;
      }
      if (state.error) return;

      // Mark it right away to prevent secondary component updates from re-triggering
      hasFetchedRef.current = true;

      try {
        const excludedIds = Array.from(globalUsedVideoIds);
        const data = await fetchSongYT(songTitle, country, user, excludedIds);

        if (!data?.videoId) {
          hasFetchedRef.current = false;
          dispatch({
            type: "SET_ERROR",
            payload: { error: "Song video could not be fetched." },
          });
          return;
        }

        globalUsedVideoIds.add(data.videoId);
        songRef.current = data;

        dispatch({
          type: "SET_VIDEO_SONG",
          payload: {
            videoId: data.videoId,
            regionCode: data.regionCode,
            song: data.song,
            playlists: [],
          },
        });
      } catch (error) {
        hasFetchedRef.current = false;
        console.error("Error fetching song", error);
        dispatch({
          type: "SET_ERROR",
          payload: { error: "Failed to fetch song " },
        });
      }
    }

    processQueue();
  }, [songTitle, storedVideoId, user.token, country, playlistId]);

  async function handleRemoveSongFromPlaylist(videoId, playlistId) {
    if (onRemoveSong) {
      onRemoveSong(song, videoId);
    } else {
      console.warn("onRemoveSong is undefined!");
    }

    try {
      await removeSongFromPlaylist(videoId, user, playlistId);
      toast.success("Song removed from playlist");
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      toast.error("Failed to remove song from playlist");
    }
  }

  if (state.loading || state.error || !state.videoId) {
    return null;
  }

  return (
    <div className="homeContainer">
      <div className={styles.menuContainer}>
        <Toaster />
        <button
          type="button"
          className={styles.optionsBtn}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
            if (menuPlaylistsOpen) {
              setMenuPlaylistsOpen(false);
            }
          }}
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
      {menuOpen && !remove && (
        <ListGroup defaultActiveKey>
          <ListGroup.Item
            action
            onClick={() => setMenuPlaylistsOpen((prev) => !prev)}
          >
            + Add to Playlist
          </ListGroup.Item>
        </ListGroup>
      )}
      {menuOpen && remove && (
        <ListGroup className={styles.removeMenu} defaultActiveKey>
          <ListGroup.Item
            action
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveSongFromPlaylist(state.videoId, remove.playlistId);
            }}
          >
            Remove from Playlist
          </ListGroup.Item>
        </ListGroup>
      )}

      {menuPlaylistsOpen && (
        <ListGroup>
          {user.playlists.map((playlist) => (
            <ListGroup.Item
              action
              key={playlist.name}
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
                    <Button
                      onClick={async () => {
                        // Create the playlist first
                        const response = await createPlaylist(
                          playlistName,
                          user,
                        );

                        if (response.status === 200) {
                          const newPlaylist = response.data.playlist;
                          toast.success(`${response.data.message}`);
                          // IMMEDIATELY add the current song to the new playlist
                          await handleAddSongToPlaylist(newPlaylist);
                        } else {
                          toast.error(
                            "Failed to create playlist. Please try again.",
                          );
                        }

                        setShowModal(false);
                        setPlaylistName("");
                      }}
                      type="submit"
                    >
                      Save changes
                    </Button>
                  </div>
                </Modal.Footer>
              </Modal.Dialog>
            </div>
          )}
        </ListGroup>
      )}
      {state.videoId && <span className={styles.songDetails}>{songTitle}</span>}
      {state.videoId &&
        // lazy-mount player only for the active/playing song to avoid multiple iframe loads
        (playingVideoId === state.videoId ? (
          <YouTube
            videoId={state.videoId}
            title={state.title}
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
              alt={state.title}
              className={styles.thumbnail}
              loading="lazy"
              onClick={() => {
                setPlayingVideoId(state.videoId);
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
      song: propTypes.string.isRequired,
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
