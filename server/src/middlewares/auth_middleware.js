const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  // console.log("Authenticating token:", token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticate };
