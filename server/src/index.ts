import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import uploadRouter from "./routes/uploadRouter";
import imageRouter from "./routes/imageRouter";

const port = 8080;

const app = express();

app.use(cors());
app.use(express.json());

const projectRoot = process.cwd();
const uploadsDir = path.join(projectRoot, "uploads");
const originalDir = path.join(uploadsDir, "original");
const previewDir = path.join(uploadsDir, "preview");

// Function to create directory if it doesn't exist
const createDirIfNotExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directory created successfully: ${dir}`);
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
      throw error;
    }
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
};

// Create necessary directories
try {
  [uploadsDir, originalDir, previewDir].forEach(createDirIfNotExists);
} catch (error) {
  console.error("Failed to create necessary directories:", error);
  process.exit(1);
}

app.use("/api", uploadRouter);
app.use("/api/images", imageRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`Original images directory: ${originalDir}`);
  console.log(`Preview images directory: ${previewDir}`);
});
