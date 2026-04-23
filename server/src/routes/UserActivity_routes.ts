import express from "express";
import UserActivityController from "../controllers/UserActivity_controller";
const router = express.Router();

router.put("/update", UserActivityController.update);

export default router;
