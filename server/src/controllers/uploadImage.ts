import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";

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
  upload.single("image")(req, res, (err) => {
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

    res.status(200).json({
      message: "File uploaded successfully",
      filename: req.file.filename,
    });
  });
};
