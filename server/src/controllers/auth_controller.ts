import jwt, { PrivateKey, PublicKey } from "jsonwebtoken";
import { userSchemaZod, UserModel } from "../schemas/User_schema";
import { Request, Response } from "express";
import { app, admin, actionCodeSettings } from "../config/firebase_config";
import { updatePasswordForUser } from "../models/Firestore/userAuth";
import { deleteAllSongs } from "../models/Firestore/songVideo";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  validatePassword,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail,
} from "firebase/auth";
import PlaylistSchema from "../schemas/Playlist_schema";
import Song_schema from "../schemas/Song_schema";

const googleLogin = async (req: Request, res: Response) => {
  const auth = getAuth();
  const { idToken } = req.body;
  console.log("Received Google ID token:", idToken);
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  // console.log("Google sign-in successful:", userCredential);
  const firebaseUser = userCredential.user;
  console.log("Google sign-in successful, user info:", {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
  });
  // console.log("Firebase user from Google sign-in:", firebaseUser);
  let dbUser = await UserModel.findOne({ email: firebaseUser.email });
  console.log("User found in database:", dbUser);
  if (!dbUser) {
    dbUser = new UserModel({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      avatar: firebaseUser.photoURL,
      country: "",
      playlists: [],
      refreshTokens: [],
    });
    await dbUser.save();
    await sendPasswordResetEmail(auth, firebaseUser.email!, actionCodeSettings);
  }

  const tokens = await generateTokens(dbUser as any);

  res.status(200).json({
    email: dbUser.email,
    country: dbUser.country,
    _id: dbUser._id,
    playlists: dbUser.playlists,
    avatar: dbUser.avatar,
    ...tokens,
  });
};

const register = async (req: Request, res: Response) => {
  const { email, password, country } = req.body;
  console.log("Registering user with email:", email);
  console.log("user country:", country);
  if (!password) {
    return res.status(400).send("BAD REQUEST: Password is required");
  }
  try {
    userSchemaZod.parse({
      email: email,
      country: country,
    });

    const existedUser = await UserModel.findOne({ email: email });
    if (existedUser != null) {
      if (existedUser.uid) {
        // If the user already exists with Google login, allow setting a password
        // on the same Firebase account so manual login works later.
        try {
          await admin.auth().updateUser(existedUser.uid, { password });
          const tokens = await generateTokens(existedUser as any);
          return res.status(200).json({
            message:
              "Password set successfully for existing Google login account.",
            email: existedUser.email,
            country: existedUser.country,
            _id: existedUser._id,
            playlists: existedUser.playlists,
            avatar: existedUser.avatar,
            ...tokens,
          });
        } catch (error: any) {
          console.error(
            "Error setting password for existing Google user:",
            error,
          );
          return res
            .status(500)
            .send("INTERNAL SERVER ERROR: " + error.message);
        }
      }
      return res.status(409).send("CONFLICT: User already existed");
    }
    const auth = getAuth(app);
    const status = await validatePassword(auth, password);
    if (!status.isValid) {
      const missingRequirements = [];
      if (status.containsLowercaseLetter === false)
        missingRequirements.push("a lowercase letter");
      if (status.containsUppercaseLetter === false)
        missingRequirements.push("an uppercase letter");
      if (status.containsNumericCharacter === false)
        missingRequirements.push("a number");
      if (status.containsNonAlphanumericCharacter === false)
        missingRequirements.push("a special character");
      if (status.meetsMinPasswordLength === false)
        missingRequirements.push("minimum length");

      if (missingRequirements.length > 0) {
        return res
          .status(400)
          .send(
            `BAD REQUEST: Password must contain: ${missingRequirements.join(", ")}.`,
          );
      } else {
        return res
          .status(400)
          .send("BAD REQUEST: Password does not meet the requirements.");
      }
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed up
        const userAuth: User = userCredential.user;

        sendEmailVerification(userAuth, actionCodeSettings)
          .then(async () => {
            console.log("Verification email sent to:", userAuth.email);
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
            console.error("Error sending verification email:", error);
            return res
              .status(500)
              .send("INTERNAL SERVER ERROR: " + error.message);
          });

        // console.log("User created in Firebase Auth:", user);
        // console.log("Firebase Auth user creation successful:", userAuth.uid);
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
  if (!password) {
    return res.status(400).send("BAD REQUEST: Password is required");
  }
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
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user, actionCodeSettings);
          return res
            .status(403)
            .json({
              message: "FORBIDDEN: Please verify your email before logging in.",
              resentVerification: true,
            });
        }
        const userAuth = userCredential.user;
        console.log("User signed in to Firebase Auth:", user);
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
        if (
          errorCode === "auth/wrong-password" ||
          errorCode === "auth/user-not-found"
        ) {
          return res
            .status(401)
            .send("UNAUTHORIZED: Invalid email or password");
        }
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
        console.log("Decoded token for account deletion:", decoded.id);
        const foundUser = await UserModel.findById(decoded.id);
        if (!foundUser) return res.sendStatus(404);

        // Delete from Firebase Auth using Admin SDK — no re-auth needed
        if (foundUser.uid) {
          await admin.auth().deleteUser(foundUser.uid);
        }
        await deleteAllSongs();
        // Delete all user's playlists from MongoDB
        await PlaylistSchema.deleteMany({ user: foundUser._id });
        // Delete all songs in those playlists from MongoDB
        await Song_schema.deleteMany({
          playlist: { $in: foundUser.playlists },
        });
        // Delete the user from MongoDB
        await foundUser.deleteOne();
        console.log("Account deleted successfully");
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
    return res.status(400).json({ error: "User ID is required" });
  }

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current and new passwords are required" });
  }

  try {
    const auth = getAuth(app);
    const validationPassword = await validatePassword(auth, newPassword);
    if (!validationPassword.isValid) {
      const missingRequirements = [];
      if (validationPassword.containsLowercaseLetter === false)
        missingRequirements.push("a lowercase letter");
      if (validationPassword.containsUppercaseLetter === false)
        missingRequirements.push("an uppercase letter");
      if (validationPassword.containsNumericCharacter === false)
        missingRequirements.push("a number");
      if (validationPassword.containsNonAlphanumericCharacter === false)
        missingRequirements.push("a special character");
      if (validationPassword.meetsMinPasswordLength === false)
        missingRequirements.push("minimum length");

      if (missingRequirements.length > 0) {
        return res.status(400).json({
          error: `Password must contain: ${missingRequirements.join(", ")}.`,
        });
      } else {
        return res
          .status(400)
          .json({ error: "Password does not meet the requirements." });
      }
    }
    await updatePasswordForUser(userId, currentPassword, newPassword);
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error: Error | any) {
    const msg =
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
        ? "Current password is incorrect."
        : error.code === "auth/weak-password"
          ? "New password is too weak."
          : error.message;
    res.status(400).json({ error: msg });
  }
};
export default {
  register,
  login,
  googleLogin,
  refreshToken,
  logout,
  deleteAccount,
  changePassword,
};
