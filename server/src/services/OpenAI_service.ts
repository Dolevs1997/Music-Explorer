import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import { Playlist } from "../schemas/Playlist_schema";
import { uploadToCloudinary } from "../services/Cloudniary_service";
dotenv.config();

const openaiAPIKey = process.env.OPENAI_API_KEY as string;
const openai = new OpenAI({ apiKey: openaiAPIKey });
type MessageRole = "system" | "user" | "assistant";

interface Message {
  role: MessageRole;
  content: string;
}

interface SongSuggestion {
  song: {
    title: string;
    artists: string;
  };
}

const SongSuggestions = async (text: Message) => {
  console.log("SongSuggestions input:", text); // Debugging line
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0.0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "song_suggestions",
        strict: true,
        schema: {
          type: "object",
          properties: {
            songs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  song: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      artists: { type: "string" },
                      album: { type: "string" },
                      duration: { type: "string" },
                    },
                    required: ["title", "artists", "album", "duration"],
                    additionalProperties: false,
                  },
                },
                required: ["song"],
                additionalProperties: false,
              },
            },
          },
          required: ["songs"],
          additionalProperties: false,
        },
      },
    },

    messages: [
      {
        role: "system",
        content:
          "You are a strict music assistant. Return only song suggestions that clearly match the user's description. Return valid JSON with a songs array containing up to 50 objects. Each object must have exactly this shape: { song: { title: string, artists: string,album:string,duration:string } }. Exclude live versions, trailers, podcasts, interviews, reviews, covers, remixes, instrumentals, and non-music/video content. Do not include duplicates.Set duration to null; do not estimate.  If no relevant songs exist, return { songs: [] }.",
      },
      {
        role: text.role,
        content:
          "Provide me with a list of song suggestions based on the following description: " +
          text.content +
          " Return only the requested JSON structure. If no relevant songs exist, return { songs: [] }.",
      },
    ],
    store: true,
  });

  const suggestions = completion.choices[0].message.content;
  if (!suggestions) {
    return [];
  }

  const parsedSuggestions = JSON.parse(suggestions) as {
    songs?: SongSuggestion[];
  };
  if (Array.isArray(parsedSuggestions.songs))
    parsedSuggestions?.songs.map(({ song }) => {
      console.log("song fetched from openai: ", song);
    });
  return Array.isArray(parsedSuggestions.songs)
    ? parsedSuggestions.songs.map(({ song }) => song)
    : [];
};

const SongSuggestionsVoice = async () => {
  const transcription: OpenAI.Audio.Transcriptions.Transcription & {
    _request_id?: string | null;
  } = await openai.audio.transcriptions.create({
    file: fs.createReadStream("/path/to/file/audio.mp3"),
    model: "gpt-4o-transcribe",
  });
  if (!transcription.text) {
    throw new Error("Transcription failed");
  }
  const songSuggestions = await SongSuggestions({
    role: "user",
    content: transcription.text,
  });

  return songSuggestions;
};

const generatePlaylistPicture = async (playlist: Playlist, prompt: string) => {
  const result = await openai.images.generate({
    model: "gpt-image-1.5",
    prompt,
  });
  if (!result.data || result.data.length === 0) {
    throw new Error("Image generation failed");
  }
  // Save base64 to Cloudinary
  const image_base64 = result.data[0].b64_json;
  if (!result.data || result.data.length === 0 || !image_base64) {
    throw new Error("Image generation failed");
  }

  const image_bytes = Buffer.from(image_base64, "base64");

  const { data } = await uploadToCloudinary(
    image_bytes,
    `playlist-${playlist._id}-${Date.now()}.png`,
  );
  playlist.imageUrl = data?.secure_url;
  return playlist;
};

export { SongSuggestions, SongSuggestionsVoice, generatePlaylistPicture };
