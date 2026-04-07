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

// const { uploadMiddleware } = require("../middlewares/upload_middleware");

// const upload = multer({ dest: "uploads/" }); // For parsing multipart/form-data in memory

// Existing route
// router.get("/", authenticate, songController.getVideo);

router.get("/song", authenticate, songController.getById);
router.delete("/song/:videoId", authenticate, songController.deletebyVideoId);

// New route for recognition
router.post(
  "/recognize-audio",
  authenticate,
  upload.single("audioFile"),
  songController.recognizeAudio,
);

export default router;
