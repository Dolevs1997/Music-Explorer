import express from "express";
import recommends_controller from "../controllers/recommends_controller";
const RecommendRouter = express.Router();
import { authenticate } from "../middlewares/auth_middleware";
RecommendRouter.get(
  "/",
  authenticate,

  recommends_controller.getAll
);

export default RecommendRouter;
