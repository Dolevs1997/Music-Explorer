import dotenv from "dotenv";
dotenv.config();

let defaultOptions = {
  host: process.env.ACR_CLOUD_HOST,
  endpoint: "/v1/identify",
  signature_version: "1",
  data_type: "audio",
  secure: true,
  access_key: process.env.ACR_CLOUD_ACCESS_KEY,
  access_secret: process.env.ACR_CLOUD_ACCESS_SECRET,
};

export default defaultOptions;
