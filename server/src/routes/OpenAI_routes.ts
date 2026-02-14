import express, { Request, Response } from "express";
import {
  SongSuggestions,
  SongSuggestionsVoice,
  generatePlaylistPicture,
} from "../services/OpenAI_service";
import { authenticate } from "../middlewares/auth_middleware";
const openaiRouter = express.Router();

openaiRouter.post("/openai", authenticate, async (req, res) => {
  try {
    const suggestions = await SongSuggestions(req.body);
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

    const songSuggestions = await SongSuggestionsVoice();
    res.status(200).json(songSuggestions);
  } catch (error: Error | any) {
    res.status(500).json({ error: error.message });
  }
});

openaiRouter.post(
  "/openai/playlist/generate-image",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      // console.log("Request: ", req.body);
      const { prompt } = req.body;
      if (!prompt)
        return res.status(400).json({
          message: "OpenAI Error generate error: missing one or more fields",
        });
      const result = await generatePlaylistPicture(prompt);
      // console.log("result: ", result);
      return res.status(200).json({
        message: "playlist image successfully generated",
        result,
      });
    } catch (e: any | Error) {
      console.error("OpenAI image generation Error: ", e.message);
    }
  },
);

export default openaiRouter;
