import axios from "axios";
async function addSongToPlaylist(song, state, user, playlist) {
  const response = await axios.post(
    `/api/playlist/addSong?id=${playlist._id || playlist.id}`,
    {
      song: song,
      videoId: state.videoId,
      user: user,
    },
  );

  return response;
}
async function createPlaylist(playlistName, user) {
  const response = await axios.post(`/api/playlist/create`, {
    playlistName: playlistName,
    user: user,
  });
  return response;
}

async function removeSongFromPlaylist(videoId, user, playlistId) {
  const response = await axios.delete(`/api/videoSong/song/${videoId}`, {
    data: {
      user: user,
      playlistId: playlistId,
    },
  });
  return response.data;
}

async function removePlaylist(playlistId) {
  const response = await axios.delete(`/api/playlist/?id=${playlistId}`);
  console.log("removePlaylist response:", response);
  return response.data;
}

async function updatePlaylist(playlist, updatedData) {
  if (updatedData instanceof FormData) {
    const response = await axios.put(
      `/api/playlist/?id=${playlist._id || playlist.id}`,
      updatedData,
    );
    return response.data;
  } else {
    const response = await axios.put(
      `/api/playlist/?id=${playlist._id || playlist.id}`,
      updatedData,
    );
    return response.data;
  }
}

export {
  addSongToPlaylist,
  removeSongFromPlaylist,
  removePlaylist,
  updatePlaylist,
  createPlaylist,
};
