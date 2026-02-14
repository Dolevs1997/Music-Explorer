import axios from "axios";
async function addSongToPlaylist(song, state, user, playlist) {
  console.log("Adding song to playlist:", {
    song: song,
    videoId: state.videoId,
    user,
    playlistId: playlist._id || playlist.id,
  });
  const response = await axios.post(
    `http://${import.meta.env.VITE_SERVER_URL}/moodiify/playlist/addSong?id=${playlist._id || playlist.id}`,
    {
      song: song,
      videoId: state.videoId,
      user: user,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    },
  );
  console.log("response: ", response);
  // if (!Array.isArray(user.playlists)) {
  //   user.playlists = [];
  // }

  return response;
}
async function createPlaylist(playlistName, user) {
  const response = await axios.post(
    `http://${import.meta.env.VITE_SERVER_URL}/moodiify/playlist/create`,
    {
      playlistName: playlistName,
      user: user,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    },
  );
  return response;
}

async function removeSongFromPlaylist(videoId, user, playlistId) {
  const response = await axios.delete(
    `http://${
      import.meta.env.VITE_SERVER_URL
    }/moodiify/videoSong/song/${videoId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      data: {
        user: user,
        playlistId: playlistId,
      },
    },
  );
  return response.data;
}

async function removePlaylist(playlistId, user) {
  const response = await axios.delete(
    `http://${import.meta.env.VITE_SERVER_URL}/moodiify/playlist/?id=${playlistId}`,
    {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    },
  );

  return response.data;
}

async function updatePlaylist(playlist, updatedData, user) {
  // console.log("updatedData: ", updatedData.get("image"));
  // console.log("user", user);
  const isFormData = updatedData instanceof FormData;
  const response = await axios.put(
    `http://${import.meta.env.VITE_SERVER_URL}/moodiify/playlist/?id=${playlist._id || playlist.id}`,

    updatedData,

    {
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${user.token}`,
      },
    },
  );
  return response.data;
}

export {
  addSongToPlaylist,
  removeSongFromPlaylist,
  removePlaylist,
  updatePlaylist,
  createPlaylist,
};
