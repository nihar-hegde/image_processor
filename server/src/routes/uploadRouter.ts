import express from "express";
import upload from "../services/uploadServices";
import { uploadImage } from "../controllers/uploadImage";

const UploadRouter = express.Router();

UploadRouter.post("/upload", upload.single("image"), uploadImage);

export default UploadRouter;
