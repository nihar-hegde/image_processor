import express, { Router } from "express";
import {
  getOriginalImage,
  getPreviewImage,
  processImage,
} from "../controllers/imageController";

const imageRouter = express.Router();

imageRouter.get("/preview/:imageId", getPreviewImage);
imageRouter.get("/original/:imageId", getOriginalImage);
imageRouter.get("/process", processImage);

export default imageRouter;
