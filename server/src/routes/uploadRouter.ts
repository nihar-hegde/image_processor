import express from "express";
import { uploadImage } from "../controllers/uploadImage";

const UploadRouter = express.Router();

UploadRouter.post("/upload", uploadImage);

export default UploadRouter;
