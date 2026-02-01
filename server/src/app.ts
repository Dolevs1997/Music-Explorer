// Description: This file is the entry point of the application.

import express from "express";
import mongoose from "mongoose";
import categoriesRouter from "./routes/Categories_routes";
import recommendRouter from "./routes/Recommends_routes";
import songRouter from "./routes/Song_routes";
import openaiRouter from "./routes/OpenAI_routes";
import uploadRouter from "./routes/upload_route";
import authRouter from "./routes/Auth_routes";
import playlistRouter from "./routes/playlist_routes";
import cors from "cors";
import { json, urlencoded } from "body-parser";
import { connectRedis } from "./services/Redis_service";
import dotenv from "dotenv";
dotenv.config();

const initApp = async () => {
  console.log("Initializing app");
  try {
    // Connect to MongoDB
    // console.log("Connecting to MongoDB...");
    mongoose.connect(process.env.DATABASE_URL as string);
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    db.once("connected", () => console.log("Connected to MongoDB"));
    // Connect to Redis
    await connectRedis();

    // Initialize Express app
    const app = express();
    app.use(cors()); // Enable CORS for all routes
    app.use(json());
    app.use(urlencoded({ extended: true }));
    app.use("/auth", authRouter);
    app.use("/moodiify/recommends", recommendRouter);
    app.use("/moodiify/categories", categoriesRouter);
    app.use("/moodiify/videoSong", songRouter);
    app.use("/moodiify/playlist", playlistRouter);
    app.use("/moodiify/upload", uploadRouter);
    app.use("/api", openaiRouter);

    return app;
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
};

export default initApp;
