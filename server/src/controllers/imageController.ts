import { Request, Response } from "express";
import path from "path";
import sharp from "sharp";

export const getPreviewImage = (req: Request, res: Response) => {
  const imagePath = path.join("uploads", "preview", req.params.id);
  res.sendFile(imagePath, { root: "." });
};

export const getOriginalImage = (req: Request, res: Response) => {
  const imagePath = path.join("uploads", "original", req.params.id);
  res.sendFile(imagePath, { root: "." });
};

export const processImage = async (req: Request, res: Response) => {
  const { imageId, brightness, contrast, saturation, rotation } = req.body;

  try {
    const originalPath = path.join("uploads", "original", imageId);
    const previewPath = path.join(
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
