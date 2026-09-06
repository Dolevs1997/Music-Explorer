import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
dotenv.config();
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "", (err: any) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }

    next();
  });
};

export { authenticate };
