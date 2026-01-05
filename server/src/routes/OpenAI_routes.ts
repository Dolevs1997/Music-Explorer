import express from "express";
import OpenAI_service from "../services/OpenAI_service";
import { authenticate } from "../middlewares/auth_middleware";
const openaiRouter = express.Router();

openaiRouter.post("/openai", authenticate, async (req, res) => {
  try {
    const suggestions = await OpenAI_service.SongSuggestions(req.body);
    res.status(200).json(suggestions);
  } catch (error: Error | any) {
    res.status(500).json({ error: error.message });
  }
});

openaiRouter.post("/openai/voice-search", authenticate, async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { audioFilePath } = req.body;
    if (!audioFilePath) {
      return res.status(400).json({ error: "Please provide audio file path" });
    }

    const songSuggestions = await OpenAI_service.SongSuggestionsVoice();
    res.status(200).json(songSuggestions);
  } catch (error: Error | any) {
    res.status(500).json({ error: error.message });
  }
});

export default openaiRouter;
