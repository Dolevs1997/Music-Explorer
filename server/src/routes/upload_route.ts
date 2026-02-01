import express from "express";
import { uploadToCloudinary } from "../services/Cloudniary_service";
import { authenticate } from "../middlewares/auth_middleware";
import multer from "multer";
const uploadRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
uploadRouter.post(
  "/",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    try {
      console.log("Received file upload request");
      // console.log(req);
      const file = req.file;
      console.log("filePath: ", file);
      if (!file) {
        return res
          .status(400)
          .json({ error: "filePath is required in the request body" });
      }
      const { data } = await uploadToCloudinary(file.buffer, file.originalname);
      const imageUrl = data?.secure_url;
      console.log("imageUrl: ", imageUrl);
      if (!imageUrl) {
        return res
          .status(500)
          .json({ error: "Failed to retrieve image URL from Cloudinary" });
      }
      res.status(200).json({ imageUrl });
    } catch (error: Error | any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default uploadRouter;
