import cloudinary from "../config/cloudniary_config";

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
          console.log("Cloudinary upload result: ", result);
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
