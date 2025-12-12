const dotenv = require("dotenv");
const OpenAI = require("openai");
const fs = require("fs");
dotenv.config();

const openaiAPIKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI(openaiAPIKey);
const SongSuggestions = async (text) => {
  console.log("text: ", text);

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0.9,

    messages: [
      {
        role: text.role,
        content:
          text.text +
          " music only artist name - song name - year. return it without any other information and not in a numbered list. I don't want any duplicates and only results which relate to the given text.",
      },
    ],
    store: true,
  });
  console.log("completion message: \n", completion.choices[0].message.content);

  const suggestions = completion.choices[0].message.content;
  const songSuggestions = suggestions
    .substring(suggestions.indexOf("1.").valueOf())
    .split("\n");

  return songSuggestions;
};

const SongSuggestionsVoice = async () => {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream("/path/to/file/audio.mp3"),
    model: "gpt-4o-transcribe",
  });
  console.log("transcription: ", transcription.text);

  const songSuggestions = await SongSuggestions(transcription.text);
  console.log("songSuggestions: ", songSuggestions);

  return songSuggestions;
};

module.exports = { SongSuggestions, SongSuggestionsVoice };
