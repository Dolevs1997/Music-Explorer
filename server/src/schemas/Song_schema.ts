import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
  song: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    required: false,
  },
  regionCode: {
    type: String,
    required: false,
  },
  playlists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
});

export default mongoose.model("Song", SongSchema);
