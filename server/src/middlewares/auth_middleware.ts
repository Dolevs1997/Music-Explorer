import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
dotenv.config();
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  // console.log("Authenticating token:", token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  });
};

export { authenticate };
