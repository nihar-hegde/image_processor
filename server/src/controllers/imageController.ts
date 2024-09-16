import { Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import fs from "fs";

const projectRoot = process.cwd();

export const getPreviewImage = (req: Request, res: Response) => {
  const filename = req.params.filename;
  const previewPath = path.join(projectRoot, "uploads", "preview", filename);

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

  if (fs.existsSync(originalPath)) {
    res.sendFile(originalPath);
  } else {
    console.log("Original file not found:", originalPath);
    res.status(404).json({ error: "Original image not found" });
  }
};

const applyImageEdits = (processing: sharp.Sharp, edits: any) => {
  const { brightness, contrast, saturation, rotation } = edits;
  return processing
    .rotate(parseInt(rotation))
    .modulate({
      brightness: parseFloat(brightness),
      saturation: parseFloat(saturation),
    })
    .linear(parseFloat(contrast), -(parseFloat(contrast) - 1) * 128);
};

export const processImage = async (imageId: string, editParams: any) => {
  const { brightness, contrast, saturation, rotation, cropData, reset } =
    editParams;

  try {
    const originalPath = path.join(projectRoot, "uploads", "original", imageId);
    const previewPath = path.join(
      projectRoot,
      "uploads",
      "preview",
      `${imageId.split(".")[0]}_preview.jpg`
    );

    let processing = sharp(originalPath);

    if (!reset) {
      if (cropData) {
        const croppedBuffer = Buffer.from(cropData.split(",")[1], "base64");
        processing = sharp(croppedBuffer);
      }

      processing = applyImageEdits(processing, {
        brightness,
        contrast,
        saturation,
        rotation,
      });
    }

    await processing
      .resize(300) // Smaller size for preview
      .jpeg({ quality: 80 })
      .toFile(previewPath);

    const previewUrl = `/api/images/preview/${
      imageId.split(".")[0]
    }_preview.jpg?t=${new Date().getTime()}`;
    return { previewUrl };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};

export const getFinalImage = async (req: Request, res: Response) => {
  const {
    imageId,
    brightness,
    contrast,
    saturation,
    rotation,
    format,
    cropData,
  } = req.body;

  try {
    const originalPath = path.join(projectRoot, "uploads", "original", imageId);
    const finalDir = path.join(projectRoot, "uploads", "final");
    const finalPath = path.join(
      finalDir,
      `${imageId.split(".")[0]}_final.${format}`
    );

    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    let processing = sharp(originalPath);

    if (cropData) {
      const croppedBuffer = Buffer.from(cropData.split(",")[1], "base64");
      processing = sharp(croppedBuffer);
    }

    processing = applyImageEdits(processing, {
      brightness,
      contrast,
      saturation,
      rotation,
    });

    if (format === "png") {
      processing = processing.png({ quality: 100 });
    } else {
      processing = processing.jpeg({ quality: 100 });
    }

    await processing.toFile(finalPath);

    res.download(finalPath, `processed_image.${format}`, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file");
      }
      fs.unlink(finalPath, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting file:", unlinkErr);
      });
    });
  } catch (error) {
    console.error("Error processing final image:", error);
    res.status(500).json({ error: "Error processing final image" });
  }
};
