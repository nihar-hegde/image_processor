import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const projectRoot = process.cwd();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(projectRoot, "uploads", "original");
    console.log("Upload path:", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    console.log("Generated filename:", uniqueFilename);
    cb(null, uniqueFilename);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/png"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;
