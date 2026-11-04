import express, { Request, Response } from "express";
import {
  SongSuggestions,
  generatePlaylistPicture,
} from "../services/OpenAI_service";
import { authenticate } from "../middlewares/auth_middleware";

const openaiRouter = express.Router();

openaiRouter.post("/", authenticate, async (req, res) => {
  try {
    const suggestions = await SongSuggestions(req.body);
    res.status(200).json(suggestions);
  } catch (error: Error | any) {
    console.error("OpenAI song suggestions error:", error);
    res.status(500).json({ error: error.message });
  }
});

openaiRouter.post(
  "/playlist/generate-image",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { prompt, playlist } = req.body;
      console.log(
        "Received request to generate playlist image with prompt:",
        prompt,
      ); // Debugging line
      console.log("Playlist data:", playlist); // Debugging line
      if (!prompt || !playlist)
        return res.status(400).json({
          message: "Image generation: missing one or more fields",
        });
      const result = await generatePlaylistPicture(playlist, prompt);

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
