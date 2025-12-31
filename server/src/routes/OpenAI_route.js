const express = require("express");
const OpenAI_service = require("../services/OpenAI_service");
const openaiRouter = express.Router();
const { authenticate } = require("../middlewares/auth_middleware");

openaiRouter.post("/openai", async (req, res) => {
  try {
    const suggestions = await OpenAI_service.SongSuggestions(req.body);
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

openaiRouter.post("/openai/voice-search", async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { audioFilePath } = req.body;
    if (!audioFilePath) {
      return res.status(400).json({ error: "Please provide audio file path" });
    }

    const songSuggestions = await OpenAI_service.SongSuggestionsVoice();
    res.status(200).json(songSuggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = openaiRouter;
