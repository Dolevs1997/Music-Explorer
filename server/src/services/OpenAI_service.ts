import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
dotenv.config();

const openaiAPIKey = process.env.OPENAI_API_KEY as string;
const openai = new OpenAI({ apiKey: openaiAPIKey });
type MessageRole = "system" | "user" | "assistant";

interface Message {
  role: MessageRole;
  content: string;
}
const SongSuggestions = async (text: Message) => {
  console.log("text: ", text);

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0.0,

    messages: [
      {
        role: "system",
        content:
          "You are a strict music assistant. Return ONLY song suggestions that clearly match the user's description. Output each suggestion on its own line in exactly this format: Artist - Song Title - Year. Exclude any results that are live versions, trailers, podcasts, interviews, reviews, covers, remixes, instrumentals, or any non-music/video content. Do NOT include duplicates, numbering, bullets, commentary, links, or extra text. If no relevant songs exist, return an empty response.",
      },
      {
        role: text.role,
        content:
          "Provide me with a list of song suggestions based on the following description: " +
          text.content +
          " music only: artist name - song name - year. return it without any other information and not in a numbered list. I don't want any duplicates and only results which relate to the given text.",
      },
    ],
    store: true,
  });
  console.log("completion message: \n", completion.choices[0].message.content);

  const suggestions: string | null = completion.choices[0].message.content;
  if (!suggestions) {
    return [];
  }
  const songSuggestions = suggestions
    .substring(suggestions.indexOf("1.").valueOf())
    .split("\n");

  return songSuggestions;
};

const SongSuggestionsVoice = async () => {
  const transcription: OpenAI.Audio.Transcriptions.Transcription & {
    _request_id?: string | null;
  } = await openai.audio.transcriptions.create({
    file: fs.createReadStream("/path/to/file/audio.mp3"),
    model: "gpt-4o-transcribe",
  });
  console.log("transcription: ", transcription.text);
  if (!transcription.text) {
    throw new Error("Transcription failed");
  }
  const songSuggestions = await SongSuggestions({
    role: "user",
    content: transcription.text,
  });
  console.log("songSuggestions: ", songSuggestions);

  return songSuggestions;
};

export default {
  SongSuggestions,
  SongSuggestionsVoice,
};
