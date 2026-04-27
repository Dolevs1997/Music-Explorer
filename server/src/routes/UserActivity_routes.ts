import express from "express";
import UserActivityController from "../controllers/UserActivity_controller";
import { authenticate } from "../middlewares/auth_middleware";
const router = express.Router();

router.put("/update", authenticate, UserActivityController.update);
router.get("/history", authenticate, UserActivityController.getHistorySongs);
router.post(
  "/change-password",
  authenticate,
  UserActivityController.changePassword,
);

export default router;
