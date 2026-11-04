import mongoose from "mongoose";

export interface Playlist {
  _id?: mongoose.Types.ObjectId;
  name: string;
  user: mongoose.Types.ObjectId;
  songs: mongoose.Types.ObjectId[];
  imageUrl?: string;
}

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
