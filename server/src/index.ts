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

const uploadsDir = path.join(__dirname, "uploads");
const originalDir = path.join(uploadsDir, "original");
const previewDir = path.join(uploadsDir, "preview");

[uploadsDir, originalDir, previewDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use("/api", uploadRouter);
app.use("/api/images", imageRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
