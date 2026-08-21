import cloudinary from "../config/cloudniary_config";
import path from "path";

export const uploadToCloudinary = async (
  buffer: Buffer,
  originalname: string,
) => {
  try {
    const publicId = `moodiify_images/${originalname}`;
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          public_id: publicId,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error: ", error);
            return reject(error);
          }
          return resolve({ data: result });
        },
      );
      stream.end(buffer);
    });
    return result;
  } catch (error: Error | any) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(
      error.message || "An error occurred while uploading to Cloudinary",
    );
  }
};

export const uploadAudioToCloudinary = async (
  buffer: Buffer,
  originalname: string,
  mimetype?: string,
) => {
  console.log(
    "Uploading audio to Cloudinary with original name:",
    originalname,
  );
  try {
    if (!buffer?.length) {
      throw new Error("Audio file is empty");
    }

    const extension = path.extname(originalname).toLowerCase();
    const supportedExtensions = new Set([
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".ogg",
      ".flac",
    ]);
    if (!supportedExtensions.has(extension)) {
      throw new Error(
        "Unsupported audio format. Upload MP3, WAV, M4A, AAC, OGG, or FLAC.",
      );
    }

    const publicId = path.basename(originalname, extension);
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          public_id: publicId,
          folder: "moodiify_audio",
          format: extension.slice(1),
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error: ", error);
            return reject(error);
          }
          return resolve({ data: result });
        },
      );
      stream.end(buffer);
    });
    return result;
  } catch (error: Error | any) {
    console.error("Error uploading audio to Cloudinary:", error);
    throw new Error(
      error.message || "An error occurred while uploading audio to Cloudinary",
    );
  }
};
