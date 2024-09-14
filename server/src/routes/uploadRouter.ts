import express from "express";
import { uploadImage } from "../controllers/uploadImage";
import upload from "../services/uploadServices";

const UploadRouter = express.Router();

UploadRouter.post("/upload", upload.single("image"), uploadImage);

export default UploadRouter;
