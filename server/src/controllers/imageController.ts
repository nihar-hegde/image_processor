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
      `${imageId.split(".")[0]}_preview.jpg`
    );

    await sharp(originalPath)
      .resize(300) // Smaller size for preview
      .rotate(parseInt(rotation))
      .modulate({
        brightness: parseFloat(brightness),
        saturation: parseFloat(saturation),
      })
      .linear(
        parseFloat(contrast) > 0 ? parseFloat(contrast) : 1,
        parseFloat(contrast) <= 0 ? -parseFloat(contrast) * 128 : 0
      )
      .jpeg({ quality: 80 })
      .toFile(previewPath);

    res.json({
      success: true,
      previewUrl: `/api/images/preview/${imageId.split(".")[0]}_preview.jpg`,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Error processing image" });
  }
};

export const getFinalImage = async (req: Request, res: Response) => {
  const { imageId, brightness, contrast, saturation, rotation, format } =
    req.body;

  try {
    const originalPath = path.join(projectRoot, "uploads", "original", imageId);
    const finalDir = path.join(projectRoot, "uploads", "final");
    const finalPath = path.join(
      finalDir,
      `${imageId.split(".")[0]}_final.${format}`
    );

    // Ensure the final directory exists
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    let processing = sharp(originalPath)
      .rotate(parseInt(rotation))
      .modulate({
        brightness: parseFloat(brightness),
        saturation: parseFloat(saturation),
      })
      .linear(parseFloat(contrast), -(parseFloat(contrast) - 1) * 128);

    if (format === "png") {
      processing = processing.png();
    } else {
      processing = processing.jpeg({ quality: 90 });
    }

    await processing.toFile(finalPath);

    res.download(finalPath, `processed_image.${format}`, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file");
      }
      // Delete the file after download
      fs.unlink(finalPath, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file:", unlinkErr);
      });
    });
  } catch (error) {
    console.error("Error processing final image:", error);
    res.status(500).json({ error: "Error processing final image" });
  }
};
