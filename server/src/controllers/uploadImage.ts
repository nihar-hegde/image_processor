import { Request, Response } from "express";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalPath = req.file.path;
    const filename = path.basename(originalPath);
    const previewPath = path.join(
      __dirname,
      "..",
      "uploads",
      "preview",
      filename
    );

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

export const getPreviewImage = (req: Request, res: Response) => {
  const filename = req.params.filename;
  const previewPath = path.join(
    __dirname,
    "..",
    "uploads",
    "preview",
    filename
  );

  if (fs.existsSync(previewPath)) {
    res.sendFile(previewPath);
  } else {
    res.status(404).json({ error: "Preview image not found" });
  }
};

export const getOriginalImage = (req: Request, res: Response) => {
  const filename = req.params.filename;
  const originalPath = path.join(
    __dirname,
    "..",
    "uploads",
    "original",
    filename
  );

  if (fs.existsSync(originalPath)) {
    res.sendFile(originalPath);
  } else {
    res.status(404).json({ error: "Original image not found" });
  }
};
