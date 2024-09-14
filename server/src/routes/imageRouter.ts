import express, { Router } from "express";
import {
  getOriginalImage,
  getPreviewImage,
  processImage,
} from "../controllers/imageController";

const imageRouter = express.Router();

imageRouter.get("/preview/:filename", getPreviewImage);
imageRouter.get("/original/:filename", getOriginalImage);

export default imageRouter;
