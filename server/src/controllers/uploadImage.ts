import { Request, Response } from "express";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const projectRoot = process.cwd();

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalPath = req.file.path;
    const filename = path.basename(originalPath);
    const previewPath = path.join(projectRoot, "uploads", "preview", filename);

    console.log("Original path:", originalPath);
    console.log("Preview path:", previewPath);

    // Ensure the preview directory exists
    const previewDir = path.dirname(previewPath);
    if (!fs.existsSync(previewDir)) {
      fs.mkdirSync(previewDir, { recursive: true });
    }

    // Generate preview image
    await sharp(originalPath)
      .resize(300) // Resize to 300px width
      .jpeg({ quality: 70 }) // Convert to JPEG with 70% quality
      .toFile(previewPath);

    res.status(200).json({
      message: "Image uploaded successfully",
      imageId: filename,
      previewUrl: `/api/images/preview/${filename}`,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Error uploading image" });
  }
};
