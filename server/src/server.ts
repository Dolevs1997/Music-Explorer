import { createServer } from "http";
import initApp from "./app";
import dotenv from "dotenv";
dotenv.config();
const port = parseInt(process.env.PORT || "3000", 10);

initApp().then((app) => {
  console.log("server.js: Initializing app");
  if (process.env.NODE_ENV !== "production") {
    console.log("Server is running in development mode");
    const server = createServer(app);
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }

  if (process.env.NODE_ENV === "production") {
    console.log("Server is running in production mode");
    app?.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
    });
  }
});
