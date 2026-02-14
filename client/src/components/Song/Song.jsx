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
  updatePlaylist,
} from "../../utils/playlist";
import { removeBtn } from "../../Contexts/RemoveContext";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "../Button/Button";
import toast, { Toaster } from "react-hot-toast";
import UserContext from "../../Contexts/UserContext";
import { Spinner } from "../../components/ui/spinner";

// import { generateImagePlaylist } from "../../services/OpenAI_service";
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
      };
    case "PLAY":
      return { ...state, playing: true };
    case "PAUSE":
      return { ...state, playing: false };

    default:
      return state;
  }
}

function Song({
  song,
  country = "US",
  playingVideoId,
  setPlayingVideoId,
  playlistId,
  onRemoveSong,
}) {
  const navigate = useNavigate();
  const [playlistName, setPlaylistName] = useState("");
  const [state, dispatch] = useReducer(reducer, initialSong);
  const songRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlaylistsOpen, setMenuPlaylistsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const remove = useContext(removeBtn);
  const { setUser } = useContext(UserContext);
  const user = JSON.parse(localStorage.getItem("user")) || null;
  const [loading, setLoading] = useState(false);
  // console.log("videoId in Song component:", state.videoId);
  // console.log("user:", user);
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

  async function handleAddSongToPlaylist(playlist) {
    const response = await addSongToPlaylist(song, state, user, playlist);
    if (response.status == 200) toast.success(`${response.data.message}`);
    else if (response.status != 200) toast.error(`${response.data.message}`);
    const data = response.data;
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
        (playlist) => playlist.name === data.playlist.name,
      );
      if (existingPlaylist) {
        // If it exists, update the playlist ID
        user.playlists = user.playlists.map((playlist) =>
          playlist.name === data.playlist.name
            ? { ...playlist, id: data.playlist._id }
            : playlist,
        );
        const updatedUser = {
          ...user,
          playlists: user.playlists.map((playlist) =>
            playlist.name === data.playlist.name
              ? { ...playlist, songs: [...playlist.songs, data.song] }
              : playlist,
          ),
        };
        setUser(updatedUser);
        console.log("Updated existing playlist in user.playlists");
      } else {
        const updatedUser = {
          ...user,
          playlists: [...user.playlists, data.playlist],
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
    setPlaylistName("");
  }

  useEffect(
    function () {
      async function fetchSong(song, user, country) {
        if (!song || !user.token) return;
        // if we already cached the resolved song and state already set -> do nothing
        if (songRef.current && state.videoId === songRef.current.videoId) {
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
        if (!state.error) {
          try {
            const data = await fetchSongYT(song, country, user);
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
    [song, user, country, state, playlistId],
  );

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
        <Toaster />
        {loading && <Spinner />}
        <span
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
        </span>
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
                  <Button onClick={() => setShowModal(false)} type="close">
                    Close
                  </Button>
                  <Button
                    onClick={async () => {
                      // Create the playlist first
                      setLoading(true);
                      const response = await createPlaylist(playlistName, user);

                      if (response.status === 200) {
                        const newPlaylist = response.data.playlist;

                        toast.success(`${response.data.message}`);

                        // IMMEDIATELY add the current song to the new playlist
                        await handleAddSongToPlaylist(newPlaylist);

                        // Update playlist with image generation
                        const updatedPlaylist = await updatePlaylist(
                          newPlaylist,
                          false,
                          null,
                          user,
                        );

                        // Create updated user object with new playlist
                        const updatedUser = {
                          ...user,
                          playlists: [
                            ...(user.playlists || []),
                            updatedPlaylist,
                          ],
                        };

                        // Update both state and localStorage
                        setUser(updatedUser);
                        localStorage.setItem(
                          "user",
                          JSON.stringify(updatedUser),
                        );
                        setLoading(false);
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
            onPlay={() => {
              dispatch({ type: "PLAY", payload: { playing: true } });
            }}
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
  country: propTypes.string,
  playingVideoId: propTypes.string,
  setPlayingVideoId: propTypes.func,
  playlistId: propTypes.string,
  onRemoveSong: propTypes.func,
};

export default Song;
