import express from "express";
import UserActivityController from "../controllers/UserActivity_controller";
import { authenticate } from "../middlewares/auth_middleware";
const router = express.Router();

router.put("/update", authenticate, UserActivityController.update);
router.get("/history", authenticate, UserActivityController.getHistorySongs);
router.delete(
  "/songsHistory",
  authenticate,
  UserActivityController.deleteHistorySongs,
);

export default router;
