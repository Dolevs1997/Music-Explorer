import express from "express";
import authController from "../controllers/auth_controller";
import { authenticate } from "../middlewares/auth_middleware";
const router= express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refreshToken);
router.delete("/account", authenticate, authController.deleteAccount);
router.put("/changePassword", authenticate, authController.changePassword);
export default router;
