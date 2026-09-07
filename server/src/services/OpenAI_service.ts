import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
// import { uploadToCloudinary } from "../services/Cloudniary_service";
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
                    },
                    required: ["title", "artists"],
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
          "You are a strict music assistant. Return only song suggestions that clearly match the user's description. Return valid JSON with a songs array containing up to 50 objects. Each object must have exactly this shape: { song: { title: string, artists: string } }. Exclude live versions, trailers, podcasts, interviews, reviews, covers, remixes, instrumentals, and non-music/video content. Do not include duplicates. If no relevant songs exist, return { songs: [] }.",
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
  console.log("Parsed suggestions:", parsedSuggestions); // Debugging line
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

const generatePlaylistPicture = async (prompt: string) => {
  const result = await openai.images.generate({
    model: "gpt-image-1.5",
    prompt,
  });
  if (!result.data || result.data.length === 0) {
    throw new Error("Image generation failed");
  }

  return result;
};

export { SongSuggestions, SongSuggestionsVoice, generatePlaylistPicture };
