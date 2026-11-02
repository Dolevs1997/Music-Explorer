import axios from "axios";
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export function coverUrl(publicId, size = 400) {
  if (!publicId) {
    return `https://res.cloudinary.com/${CLOUD}/image/upload/v1793543870/cover-7-indigo.svg`;
  }
  return `https://res.cloudinary.com/${CLOUD}/image/upload/c_scale,w_${size}/${publicId}.svg`;
}

async function addSongToPlaylist(song, user, playlist) {
  const response = await axios.post(
    `/api/playlist/addSong?id=${playlist._id || playlist.id}`,
    {
      song: song.query,
      videoId: song?.videoId,
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
  console.log("createPlaylist response:", response);
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
    return response;
  } else {
    const response = await axios.put(
      `/api/playlist/?id=${playlist._id || playlist.id}`,
      updatedData,
    );
    return response;
  }
}

export {
  addSongToPlaylist,
  removeSongFromPlaylist,
  removePlaylist,
  updatePlaylist,
  createPlaylist,
};
