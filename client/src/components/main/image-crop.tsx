import React, { useState, useCallback } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "../ui/button";

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedImageData: string) => void;
  onClose: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  onCropComplete,
  onClose,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 30,
    height: 30,
    x: 35,
    y: 35,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);

  const getCroppedImg = useCallback((image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }

    return canvas.toDataURL("image/jpeg");
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (completedCrop) {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Add this line
      img.onload = () => {
        const croppedImageData = getCroppedImg(img, completedCrop);
        onCropComplete(croppedImageData);
      };
      img.src = imageUrl;
    }
  }, [completedCrop, imageUrl, onCropComplete, getCroppedImg]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
        >
          <img src={imageUrl} alt="Crop me" />
        </ReactCrop>
        <div className="mt-4 flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleCropComplete}>Apply Crop</Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
