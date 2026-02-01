import express from "express";
import playlistController from "../controllers/playlist_controller";
import { authenticate } from "../middlewares/auth_middleware";
import { validateToken } from "../middlewares/SpotifyTokens";
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

// router.put("/")
// router.get(
//   "/:videoId",
//   authenticate,
//   validateToken,
//   playlistController.checkSongInPlaylist
// );

export default router;
