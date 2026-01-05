import jwt, { PrivateKey, PublicKey } from "jsonwebtoken";
import { userSchemaZod, UserModel } from "../schemas/User_schema";
import { Request, Response } from "express";
// const { addUser, getUser } = require("../models/Firestore/user");
import { app } from "../config/firebase_config";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  validatePassword,
  signOut,
  User,
} from "firebase/auth";
const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Registering user with email:", email);
  try {
    userSchemaZod.parse({
      email: email,
      password: password,
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
            "BAD REQUEST: Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character."
          );
      }
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed up
        const userAuth: User = userCredential.user;
        // console.log("User created in Firebase Auth:", user);
        console.log("Firebase Auth user creation successful:", userAuth.uid);

        const user = new UserModel({
          uid: userAuth.uid,
          email: email,
          playlists: [],
          refreshTokens: [],
        });
        // Add user to Firestore
        // const firestoreUser = await addUser(email);
        // if (firestoreUser.error) {
        //   return res
        //     .status(409)
        //     .send("CONFLICT: firestore error " + firestoreUser.error);
        // }
        const newUser = await user.save();
        res.status(200).send(newUser);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          "Error creating user in Firebase Auth:",
          errorCode,
          errorMessage
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
    process.env.ACCESS_TOKEN_SECRET as PrivateKey
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET as PrivateKey
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
      "playlists"
    );
    if (!user) return res.status(404).send("NOT FOUND: User does not exist");
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const userAuth = userCredential.user;
        // console.log("User signed in to Firebase Auth:", user);
        const isEmailValid = userSchemaZod.safeParse({
          email: userAuth.email,
          password: password,
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
          _id: user._id,
          password: user.password,
          playlists: user.playlists,
          ...tokens,
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(
          "Error signing in user in Firebase Auth:",
          errorCode,
          errorMessage
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
            (token) => token !== refreshToken
          );
          await foundUser.save();
          res.sendStatus(204);
        }
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
        password: foundUser.password,
        ...tokens,
      });
    }
  );
};

export default { register, login, refreshToken, logout };
