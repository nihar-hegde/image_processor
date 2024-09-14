import { Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import fs from "fs";

const projectRoot = process.cwd();

export const getPreviewImage = (req: Request, res: Response) => {
  const filename = req.params.filename;
  const previewPath = path.join(projectRoot, "uploads", "preview", filename);

  console.log("Requested preview filename:", filename);
  console.log("Constructed preview path:", previewPath);

  if (fs.existsSync(previewPath)) {
    res.sendFile(previewPath);
  } else {
    console.log("Preview file not found:", previewPath);
    res.status(404).json({ error: "Preview image not found" });
  }
};

export const getOriginalImage = (req: Request, res: Response) => {
  const filename = req.params.filename;
  const originalPath = path.join(projectRoot, "uploads", "original", filename);

  console.log("Requested original filename:", filename);
  console.log("Constructed original path:", originalPath);

  if (fs.existsSync(originalPath)) {
    res.sendFile(originalPath);
  } else {
    console.log("Original file not found:", originalPath);
    res.status(404).json({ error: "Original image not found" });
  }
};

export const processImage = async (req: Request, res: Response) => {
  const { imageId, brightness, contrast, saturation, rotation } = req.body;

  try {
    const originalPath = path.join(projectRoot, "uploads", "original", imageId);
    const previewPath = path.join(
      projectRoot,
      "uploads",
      "preview",
      `${imageId.split(".")[0]}.jpg`
    );

    await sharp(originalPath)
      .resize(800)
      .rotate(rotation)
      .modulate({
        brightness: brightness,
        saturation: saturation,
      })
      .linear(contrast - 1, 0)
      .jpeg({ quality: 60 })
      .toFile(previewPath);

    res.json({
      success: true,
      previewUrl: `/api/images/preview/${imageId.split(".")[0]}.jpg`,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Error processing image" });
  }
};
