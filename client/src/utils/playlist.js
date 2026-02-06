import axios from "axios";
async function addSongToPlaylist(song, state, playlistName, user) {
  console.log("Adding song to playlist:", {
    song: song,
    videoId: state.videoId,
    playlistName,
    user,
  });
  const response = await axios.post(
    `http://${import.meta.env.VITE_SERVER_URL}/moodiify/playlist/create`,
    {
      song: song,
      videoId: state.videoId,
      playlistName: playlistName,
      token: user.token,
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

async function updatePlaylist(playlistId, updatedData, user) {
  // console.log("updatedData: ", updatedData.get("image"));
  // console.log("user", user);
  const response = await axios.put(
    `http://${import.meta.env.VITE_SERVER_URL}/moodiify/playlist/?id=${playlistId}`,
    updatedData,
    {
      headers: {
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
};
