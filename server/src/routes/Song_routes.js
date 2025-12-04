const express = require("express");
const router = express.Router();
const multer = require("multer");
const songController = require("../controllers/song_controller");
const { authenticate } = require("../middlewares/auth_middleware");

const upload = multer({ dest: "uploads/" }); // For parsing multipart/form-data

// Existing route
router.get("/", authenticate, songController.getVideo);

router.get("/song", authenticate, songController.getById);
router.delete("/song", authenticate, songController.deletebyId);

// New route for recognition
router.post(
  "/recognize-audio",
  authenticate,
  upload.single("file"),
  songController.recognizeAudio
);

router.get("/playlist", authenticate, songController.getAll);

module.exports = router;
