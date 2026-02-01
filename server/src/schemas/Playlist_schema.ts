import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
  imageUrl: {
    type: String,
    default: "",
  },
});

export default mongoose.model("Playlist", PlaylistSchema);
