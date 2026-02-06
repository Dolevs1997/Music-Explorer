import express from "express";
import playlistController from "../controllers/playlist_controller";
import { authenticate } from "../middlewares/auth_middleware";
import { validateToken } from "../middlewares/SpotifyTokens";
import { uploadMiddleware } from "../middlewares/upload_middleware";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// import { auth } from "../config/firebase_config";
const router = express.Router();

router.post(
  "/create",
  authenticate,
  validateToken,
  playlistController.createPlaylist,
);
router.get(
  "/",
  authenticate,
  validateToken,
  playlistController.getPlaylistSongs,
);
router.delete(
  "/",
  authenticate,
  validateToken,
  playlistController.deletePlaylist,
);

router.put(
  "/",
  authenticate,
  validateToken,
  upload.single("image"),
  uploadMiddleware,
  playlistController.updatePlaylist,
);
// router.get(
//   "/:videoId",
//   authenticate,
//   validateToken,
//   playlistController.checkSongInPlaylist
// );

export default router;
