import axios from "axios";
async function addSongToPlaylist(song, state, user, playlist) {
  const response = await axios.post(
    `http://${import.meta.env.VITE_SERVER_URL}/music-explorer/playlist/addSong?id=${playlist._id || playlist.id}`,
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

  return response;
}
async function createPlaylist(playlistName, user) {
  const response = await axios.post(
    `http://${import.meta.env.VITE_SERVER_URL}/music-explorer/playlist/create`,
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
    }/music-explorer/videoSong/song/${videoId}`,
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
    `http://${import.meta.env.VITE_SERVER_URL}/music-explorer/playlist/?id=${playlistId}`,
    {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    },
  );

  return response.data;
}

async function updatePlaylist(playlist, updatedData, user) {
  if (updatedData instanceof FormData) {
    const response = await axios.put(
      `http://${import.meta.env.VITE_SERVER_URL}/music-explorer/playlist/?id=${
        playlist._id || playlist.id
      }`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    return response.data;
  } else {
    const response = await axios.put(
      `http://${import.meta.env.VITE_SERVER_URL}/music-explorer/playlist/?id=${
        playlist._id || playlist.id
      }`,
      updatedData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    return response.data;
  }
}

// const isFormData = updatedData instanceof FormData;
// const response = await axios.put(
//   `http://${import.meta.env.VITE_SERVER_URL}/music-explorer/playlist/?id=${playlist._id || playlist.id}`,

//   prompt ? { ...updatedData, prompt } : updatedData,

//   {
//     headers: {
//       ...(isFormData ? {} : { "Content-Type": "application/json" }),
//       Authorization: `Bearer ${user.token}`,
//     },
//   },
// );
// return response.data;

export {
  addSongToPlaylist,
  removeSongFromPlaylist,
  removePlaylist,
  updatePlaylist,
  createPlaylist,
};
