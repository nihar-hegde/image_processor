import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = [".png", ".jpg", ".jpeg"];
  const fileExt = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PNG, JPG, and JPEG files are allowed.")
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export const uploadImage = (req: Request, res: Response) => {
  upload.single("image")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({ error: err.message });
    }

    // Everything went fine.
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    try {
      // Generate a unique ID for the image
      const imageId = Date.now().toString();
      const originalPath = path.join(
        "uploads",
        "original",
        `${imageId}${path.extname(req.file.filename)}`
      );
      const previewPath = path.join("uploads", "preview", `${imageId}.jpg`);

      // Move the original file
      fs.renameSync(req.file.path, originalPath);

      // Create a low-quality preview
      await sharp(originalPath)
        .resize(800) // Resize to 800px width
        .jpeg({ quality: 60 }) // Convert to JPEG with 60% quality
        .toFile(previewPath);

      res.status(200).json({
        message: "File uploaded successfully",
        imageId: imageId,
        previewUrl: `/api/images/preview/${imageId}.jpg`,
        originalUrl: `/api/images/original/${imageId}${path.extname(
          req.file.filename
        )}`,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: "Error processing image" });
    }
  });
};
