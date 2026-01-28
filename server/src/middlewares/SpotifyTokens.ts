import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
dotenv.config();

var client_id = process.env.SPOTIFY_CLIENT_ID;
var client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const getToken = async () => {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  const data = await result.json();
  return data.access_token;
};

const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token: string = await getToken();
    // console.log("token: ", token);
    req.headers["spotify-token"] = token;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

export { validateToken };
