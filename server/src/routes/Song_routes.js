const express = require("express");
const router = express.Router();
const multer = require("multer");
const songController = require("../controllers/song_controller");
const { authenticate } = require("../middlewares/auth_middleware");
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

module.exports = router;
