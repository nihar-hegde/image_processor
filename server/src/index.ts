import express from "express";
import cors from "cors";
import UploadRouter from "./routes/uploadRouter";
import imageRouter from "./routes/imageRouter";

const port = 8080;

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", UploadRouter);
app.use("/api/images", imageRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
