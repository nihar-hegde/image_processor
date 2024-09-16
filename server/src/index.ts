import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import uploadRouter from "./routes/uploadRouter";
import imageRouter from "./routes/imageRouter";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { handleWebSocketMessage } from "./websocket/webscokethandler";

const port = 8080;

const app = express();

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const projectRoot = process.cwd();
const uploadsDir = path.join(projectRoot, "uploads");
const originalDir = path.join(uploadsDir, "original");
const previewDir = path.join(uploadsDir, "preview");

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

try {
  [uploadsDir, originalDir, previewDir].forEach(createDirIfNotExists);
} catch (error) {
  console.error("Failed to create necessary directories:", error);
  process.exit(1);
}

app.use("/api", uploadRouter);
app.use("/api/images", imageRouter);

// websocket server for image processing.

wss.on("connection", (ws: WebSocket) => {
  console.log("New WebSocket connection");

  ws.on("message", (message: string) => {
    // Handle incoming WebSocket messages
    const data = JSON.parse(message);
    handleWebSocketMessage(ws, data);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`Original images directory: ${originalDir}`);
  console.log(`Preview images directory: ${previewDir}`);
});
