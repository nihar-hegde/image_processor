import express, { Router } from "express";
import {
  getFinalImage,
  getOriginalImage,
  getPreviewImage,
  processImage,
} from "../controllers/imageController";

const imageRouter = express.Router();

imageRouter.get("/preview/:filename", getPreviewImage);
imageRouter.get("/original/:filename", getOriginalImage);
imageRouter.post("/process", processImage);
imageRouter.post("/final", getFinalImage);

export default imageRouter;
