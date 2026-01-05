import express from "express";
import multer from "multer";
import songController from "../controllers/song_controller";
import { authenticate } from "../middlewares/auth_middleware";
const router = express.Router();
// const { uploadMiddleware } = require("../middlewares/upload_middleware");

const upload = multer({ dest: "uploads/" }); // For parsing multipart/form-data in memory

// Existing route
// router.get("/", authenticate, songController.getVideo);

router.get("/song", authenticate, songController.getById);
router.delete("/song/:videoId", authenticate, songController.deletebyVideoId);

// New route for recognition
router.post(
  "/recognize-audio",
  authenticate,
  upload.single("audioFile"),
  songController.recognizeAudio
);

router.get("/playlist", authenticate, songController.getAll);

export default router;
