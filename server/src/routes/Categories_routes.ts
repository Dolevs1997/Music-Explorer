import express from "express";
import category_controller from "../controllers/category_controller";
import { authenticate } from "../middlewares/auth_middleware";
import { validateToken } from "../middlewares/SpotifyTokens";
const CategoryRouter = express.Router();

CategoryRouter.get(
  "/getAll",
  authenticate,
  validateToken,
  category_controller.getAll,
);

CategoryRouter.get(
  "/category",
  authenticate,
  validateToken,
  category_controller.getById,
);
CategoryRouter.get(
  "/category/playlist-songs",
  authenticate,
  category_controller.getPlaylistSongs,
);

export default CategoryRouter;
