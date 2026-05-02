import mongoose from "mongoose";
import zod from "zod";
const z = zod;

// Zod schema for user validation
const userSchemaZod = z.object({
  email: z.string().email("Invalid email address"),
  country: z.object({
    shortName: z.string(),  
    fullName: z.string(),
  }).optional(),
  refreshTokens: z.array(z.string()).optional(),
});

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  country: {
    type: Object,
    required: false,
    properties: {
      shortName: {
        type: String,
        required: false,
      },
      fullName: {
        type: String,
        required: false,
      }
    }
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
