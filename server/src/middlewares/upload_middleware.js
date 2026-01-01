// import { getStorage, ref, uploadBytes } from "firebase/storage";
// import { app } from "../config/firebase_config.js";

// const storage = getStorage(app);

// const uploadMiddleware = async (req, res, next) => {
//   console.log("Upload middleware called");
//   console.log("File info:", req.file);
//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }
//   try {
//     const storageRef = ref(storage, `uploads/${req.file.originalname}`);
//     await uploadBytes(storageRef, req.file.buffer);
//     console.log("File uploaded successfully to Firebase Storage");
//     next();
//   } catch (error) {
//     console.error("Error uploading file to Firebase Storage:", error);
//     return res.status(500).json({ error: "File upload failed" });
//   }
// };

// export { uploadMiddleware };
