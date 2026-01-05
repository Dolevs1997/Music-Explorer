import mongoose from "mongoose";
import zod from "zod";
const z = zod;

// Zod schema for user validation
const userSchemaZod = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  refreshTokens: z.array(z.string()).optional(),
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshTokens: {
    type: [String],
    required: false,
  },
  playlists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export type UserType = mongoose.InferSchemaType<typeof userSchema>;
const UserModel = mongoose.model("User", userSchema);
export { userSchemaZod, UserModel };
