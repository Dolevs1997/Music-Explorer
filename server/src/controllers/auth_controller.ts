import jwt, { PrivateKey, PublicKey } from "jsonwebtoken";
import { userSchemaZod, UserModel } from "../schemas/User_schema";
import { Request, Response } from "express";
import { app } from "../config/firebase_config";
import { updatePasswordForUser } from "../models/Firestore/userAuth";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  validatePassword,
  signOut,
  User,
} from "firebase/auth";
import * as admin from "firebase-admin";
import PlaylistSchema from "../schemas/Playlist_schema";
import Song_schema from "../schemas/Song_schema";
const register = async (req: Request, res: Response) => {
  const { email, password, country } = req.body;
  console.log("Registering user with email:", email);
  console.log("user country:", country);
  try {
    userSchemaZod.parse({
      email: email,
      country: country,
    });

    const existedUser = await UserModel.findOne({ email: email });
    if (existedUser != null)
      return res.status(409).send("CONFLICT: User already existed");
    const auth = getAuth(app);
    const status = await validatePassword(auth, password);
    if (!status.isValid) {
      if (
        status.containsLowercaseLetter === false ||
        status.containsUppercaseLetter === false ||
        status.containsNumericCharacter === false ||
        status.containsNonAlphanumericCharacter === false
      ) {
        return res
          .status(400)
          .send(
            "BAD REQUEST: Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.",
          );
      }
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed up
        const userAuth: User = userCredential.user;
        // console.log("User created in Firebase Auth:", user);
        // console.log("Firebase Auth user creation successful:", userAuth.uid);

        const user = new UserModel({
          uid: userAuth.uid,
          email: email,
          avatar: "",
          country: country,
          playlists: [],
          refreshTokens: [],
        });
        const newUser = await user.save();
        res.status(200).send(newUser);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          "Error creating user in Firebase Auth:",
          errorCode,
          errorMessage,
        );
        return res.status(500).send("INTERNAL SERVER ERROR: " + errorMessage);
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during registration:", error.message);
      console.error("Stack trace:", error.stack);
      res.status(400).send("BAD REQUEST: Register failed " + error.message);
    }
  }
};

const generateTokens = async (user: jwt.JwtPayload) => {
  const token = jwt.sign(
    { id: user?._id },
    process.env.ACCESS_TOKEN_SECRET as PrivateKey,
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET as PrivateKey,
  );
  if (user.refreshTokens == null) user.refreshTokens = [refreshToken];
  else user.refreshTokens.push(refreshToken);
  await user.save();
  return { token, refreshToken };
};
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email: email }).populate(
      "playlists",
    );
    // console.log("user found in database:", user);
    if (!user) return res.status(404).send("NOT FOUND: User does not exist");
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const userAuth = userCredential.user;
        // console.log("User signed in to Firebase Auth:", user);
        const isEmailValid = userSchemaZod.safeParse({
          email: userAuth.email,
        });
        if (!isEmailValid.success)
          return res.status(400).send("BAD REQUEST: Invalid user data");
        // const userFirestore = await getUser(email);
        // if (!userFirestore)
        //   return res
        //     .status(404)
        //     .send("NOT FOUND: User does not exist in Firestore");

        const tokens = await generateTokens(user);
        res.status(200).json({
          email: user.email,
          country: user.country,
          _id: user._id,
          playlists: user.playlists,
          avatar: user.avatar,
          ...tokens,
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          "Error signing in user in Firebase Auth:",
          errorCode,
          errorMessage,
        );
        return res.status(500).send("INTERNAL SERVER ERROR: " + errorMessage);
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during login:", error.message);
      console.error("Stack trace:", error.stack);
      res.status(400).send("BAD REQUEST: Login failed " + error.message);
    }
  }
};

// This function is used to logout the user by removing the refresh token from the database
const logout = async (req: Request, res: Response) => {
  const refreshToken = req.headers["authorization"]?.split(" ")[1];
  if (!refreshToken) return res.sendStatus(401);
  const auth = getAuth(app);
  signOut(auth)
    .then(() => {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as PublicKey,
        async (err, user) => {
          if (!user || typeof user === "string")
            return res.status(401).send("UNAUTHORIZED: Invalid token");
          if (err) return res.sendStatus(403);
          const foundUser = await UserModel.findById(user.id);
          if (foundUser == null || foundUser == undefined)
            return res.status(401).send("UNAUTHORIZED: User not found");

          foundUser.refreshTokens = foundUser.refreshTokens?.filter(
            (token) => token !== refreshToken,
          );
          await foundUser.save();
          res.sendStatus(204);
        },
      );
    })
    .catch((error) => {
      console.error("Error signing out user from Firebase Auth:", error);
      return res.status(500).send("INTERNAL SERVER ERROR: " + error.message);
    });
};

// This function is used to refresh the access token using the refresh token
// The refresh token is sent in the request headers and is verified.
const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.headers["authorization"]?.split(" ")[1];
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as PublicKey,
    async (err, user) => {
      if (!user || typeof user === "string")
        return res.status(401).send("UNAUTHORIZED: Invalid token");
      if (err) return res.sendStatus(403);
      const foundUser = await UserModel.findById(user.id);
      if (!foundUser) return res.sendStatus(401);
      if (!foundUser.refreshTokens?.includes(refreshToken))
        return res.sendStatus(403);
      const tokens = await generateTokens(foundUser);
      res.status(200).json({
        email: foundUser.email,
        _id: foundUser._id,
        ...tokens,
      });
    },
  );
};

const deleteAccount = async (req: Request, res: Response) => {
  // Uses the regular access token (not refresh token)
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as PublicKey,
    async (err, decoded) => {
      if (!decoded || typeof decoded === "string")
        return res.status(401).send("UNAUTHORIZED: Invalid token");
      if (err) return res.sendStatus(403);

      try {
        const foundUser = await UserModel.findById(decoded.id);
        if (!foundUser) return res.sendStatus(404);

        // Delete from Firebase Auth using Admin SDK — no re-auth needed
        if (foundUser.uid) {
          await admin.auth().deleteUser(foundUser.uid);
        }

        // Delete all user's playlists from MongoDB
        await PlaylistSchema.deleteMany({ user: foundUser._id });
        // Delete all songs in those playlists from MongoDB
        await Song_schema.deleteMany({
          playlist: { $in: foundUser.playlists },
        });
        // Delete the user from MongoDB
        await foundUser.deleteOne();

        res.sendStatus(204);
      } catch (error: any) {
        console.error("Error deleting account:", error);
        res.status(500).json({ message: "Failed to delete account" });
      }
    },
  );
};
const changePassword = async (req: Request, res: Response) => {
  const userId = req.query.id as string;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new passwords are required" });
  }

  try {
    await updatePasswordForUser(currentPassword, newPassword);
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error: Error | any) {
    const msg =
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
        ? "Current password is incorrect."
        : error.code === "auth/weak-password"
          ? "New password is too weak."
          : "Failed to change password. Please try again.";
    throw new Error(msg);
  }
};
export default {
  register,
  login,
  refreshToken,
  logout,
  deleteAccount,
  changePassword,
};
