import express from "express";
import songController from "../controllers/song_controller";
import { authenticate } from "../middlewares/auth_middleware";
const router = express.Router();
import multer from "multer";

// Use memory storage instead of disk
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/song", authenticate, songController.getById);
router.delete("/song/:videoId", authenticate, songController.deletebyVideoId);

router.post(
  "/recognize-audio",
  authenticate,
  upload.single("audioFile"),
  songController.recognizeAudio,
);

export default router;
