import styles from "./Song.module.css";
import { useState, useEffect, useReducer, useRef, useContext } from "react";
import { useNavigate } from "react-router";
import YouTube from "react-youtube";
import propTypes from "prop-types";
import { fetchSongYT } from "../../services/YouTube_service";
import {
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "../../utils/playlist";
import { removeBtn } from "../../Contexts/RemoveContext";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const opts = {
  height: "300",
  width: "400",
  playerVars: {
    // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
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
      };
    default:
      return state;
  }
}

function Song({
  song,
  user,
  country = "US",
  playingVideoId,
  setPlayingVideoId,
  playlistId,
  onRemoveSong,
}) {
  const navigate = useNavigate();
  const [playlistName, setPlaylistName] = useState("");
  const [state, dispatch] = useReducer(reducer, initialSong);
  const playerRef = useRef(null);
  const [setIsSongPlaying] = useState(false);
  const songRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlaylistsOpen, setMenuPlaylistsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const remove = useContext(removeBtn);
  console.log("videoId in Song component:", state.videoId);
  if (!user.token) {
    navigate("/login");
  }
  if (!user.playlists) {
    user.playlists = [];
    localStorage.setItem("user", JSON.stringify(user));
    console.log("No playlists found, initializing user.playlists");
  }
  if (user.playlists.length === 0) {
    user.playlists = [];
  }

  async function handleAddSongToPlaylist(playlistName) {
    console.log("user in handleAddSongToPlaylist:", user);
    const data = await addSongToPlaylist(song, state, playlistName, user);
    console.log("data: ", data);
    // console.log("playlistName: ", data.playlist.name);
    try {
      dispatch({
        type: "SET_IN_PLAYLIST",
        payload: {
          videoId: data.videoId,
          song: data.song,
          playlists: [data.playlist.name],
        },
      });
      // Check if the playlist already exists
      const existingPlaylist = user.playlists.find(
        (playlist) => playlist.name === data.playlist.name
      );
      console.log("existingPlaylist:", existingPlaylist);
      if (existingPlaylist) {
        // If it exists, update the playlist ID
        user.playlists = user.playlists.map((playlist) =>
          playlist.name === data.playlist.name
            ? { ...playlist, id: data.playlist._id }
            : playlist
        );
      } else {
        user.playlists.push({
          id: data.playlist._id,
          name: data.playlist.name,
        });
      }

      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
    setPlaylistName("");
  }
  // console.log("playlistId: ", state.playlistId);
  useEffect(
    function () {
      async function fetchSong(song, user, country) {
        if (!song || !user.token) return;
        // if we already cached the resolved song and state already set -> do nothing
        if (songRef.current && state.videoId === songRef.current.videoId) {
          // nothing to do
          return;
        }
        if (songRef.current) {
          console.log("Using cached song data");
          dispatch({
            type: "SET_VIDEO_SONG",
            payload: {
              videoId: songRef.current.videoId,
              regionCode: songRef.current.regionCode,
              song: songRef.current.song,
              playlists: songRef.current.playlists,
            },
          });
          return;
        }
        // console.log("rendering: ", (render += 1));
        if (!state.error) {
          try {
            const data = await fetchSongYT(song, country, user);
            // console.log("data", data);
            songRef.current = data;

            dispatch({
              type: "SET_VIDEO_SONG",
              payload: {
                videoId: data.videoId,
                regionCode: data.regionCode,
                song: data.song,
                playlists: songRef.current.playlists,
              },
            });
          } catch (error) {
            console.error("Error fetching song recommendations:", error);
            dispatch({
              type: "SET_ERROR",
              payload: { error: "Failed to fetch song recommendations" },
            });
          }
        }
      }

      fetchSong(song, user, country);
    },
    [song, user, country, state, playlistId]
  );

  useEffect(() => {
    if (
      playerRef.current &&
      playingVideoId &&
      playingVideoId !== state.videoId
    ) {
      try {
        playerRef.current.pauseVideo();
        setIsSongPlaying(false);
      } catch (error) {
        // ignore if player not ready
        console.error("Error pausing video:", error);
      }
    }
  }, [playingVideoId, state.videoId, setIsSongPlaying]);
  function onPlayerReady(event) {
    playerRef.current = event.target;
  }

  async function handleRemoveSongFromPlaylist(videoId, playlistId) {
    const data = await removeSongFromPlaylist(videoId, user, playlistId);
    console.log("Removed song from playlist:", data);
    try {
      if (onRemoveSong) {
        console.log("song", song);
        console.log("Calling onRemoveSong for videoId:", videoId);
        onRemoveSong(song);
      } else {
        console.log("onRemoveSong:", onRemoveSong);
        console.warn("onRemoveSong is undefined!");
      }

      // Optionally update user.playlists in localStorage if needed
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error("Error removing song from playlist:", error);
    }
  }

  return (
    <div className="homeContainer">
      <div>
        <button
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
          &#x22EE;
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
        <ListGroup defaultActiveKey>
          <ListGroup.Item
            action
            onClick={() =>
              handleRemoveSongFromPlaylist(state.videoId, remove.playlistId)
            }
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
              onClick={() => handleAddSongToPlaylist(playlist.name)}
            >
              {playlist.name}
            </ListGroup.Item>
          ))}
          <ListGroup.Item action onClick={() => setShowModal(true)}>
            Create New Playlist
          </ListGroup.Item>
          {showModal && (
            <div className={styles.modalOverlay}>
              <Modal.Dialog style={{ marginTop: "20px" }}>
                <Modal.Body>Enter Playlist Name:</Modal.Body>
                <Form.Control
                  type="text"
                  placeholder="Playlist Name"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                />
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleAddSongToPlaylist(playlistName);
                      setShowModal(false);
                    }}
                    variant="primary"
                  >
                    Save changes
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </div>
          )}
        </ListGroup>
      )}
      <div className={styles.optionsMenu}></div>
      <span className={styles.songDetails}>{song}</span>
      {state.videoId ? (
        // lazy-mount player only for the active/playing song to avoid multiple iframe loads
        playingVideoId === state.videoId ? (
          <YouTube
            videoId={state.videoId}
            title={state.title}
            opts={opts}
            onReady={onPlayerReady}
            onPlay={() => {
              setPlayingVideoId(state.videoId);
              setIsSongPlaying(true);
            }}
            onPause={() => {
              setIsSongPlaying(false);
              if (playingVideoId === state.videoId) {
                setPlayingVideoId(null);
              }
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
                console.log("Clicked to play videoId:", state.videoId);
                setPlayingVideoId(state.videoId);
              }}
            />
          </div>
        )
      ) : (
        <div className={styles.noVideo}>No Video Available</div>
      )}
      {/* {state.loading && <div className={styles.loading}>Loading...</div>} */}
      {/* {state.error && <div className={styles.error}>{state.error}</div>} */}
    </div>
  );
}

Song.propTypes = {
  song: propTypes.string.isRequired,
  user: propTypes.shape({
    _id: propTypes.string.isRequired,
    name: propTypes.string.isRequired,
    email: propTypes.string.isRequired,
    token: propTypes.string.isRequired,
    playlists: propTypes.arrayOf(
      propTypes.shape({
        name: propTypes.string,
      })
    ),
  }).isRequired,
  country: propTypes.string,
  playingVideoId: propTypes.string,
  setPlayingVideoId: propTypes.func,
  playlistId: propTypes.string,
  onRemoveSong: propTypes.func,
};

export default Song;
