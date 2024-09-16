import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useImage } from "@/context/imageContext";
import { useWebSocket } from "@/context/websocketContext";
import { Slider } from "../ui/slider";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";
import ImageCropper from "../main/image-crop";

const initialImageParams = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  rotation: 0,
};

export default function EditPage() {
  const { imageId, previewUrl, setPreviewUrl } = useImage();
  const { sendMessage, lastMessage } = useWebSocket();
  const [imageParams, setImageParams] = useState(initialImageParams);
  const [downloadFormat, setDownloadFormat] = useState("jpg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [cropData, setCropData] = useState<string | null>(null);
  const [isEdited, setIsEdited] = useState(false);
  const prevParamsRef = useRef(imageParams);

  const processImage = useCallback(() => {
    if (imageId) {
      sendMessage({
        type: "imageEdit",
        imageId,
        ...imageParams,
        cropData,
      });
      setIsProcessing(true);
    }
  }, [imageId, imageParams, cropData, sendMessage]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === "previewUpdate") {
      setPreviewUrl("http://localhost:8080" + lastMessage.previewUrl);
      setIsProcessing(false);
      setIsEdited(true);
    } else if (lastMessage && lastMessage.type === "error") {
      console.error("Error processing image:", lastMessage.message);
      setIsProcessing(false);
    }
  }, [lastMessage, setPreviewUrl]);

  const handleCropComplete = useCallback(
    (croppedImageData: string) => {
      setIsCropping(false);
      setCropData(croppedImageData);
      processImage();
    },
    [processImage]
  );

  const debouncedProcessImage = useCallback(
    debounce(() => {
      if (
        JSON.stringify(imageParams) !== JSON.stringify(prevParamsRef.current)
      ) {
        processImage();
        prevParamsRef.current = { ...imageParams };
      }
    }, 300),
    [imageParams, processImage]
  );

  useEffect(() => {
    debouncedProcessImage();
    return () => {
      debouncedProcessImage.cancel();
    };
  }, [debouncedProcessImage]);

  const handleSliderChange =
    (param: keyof typeof imageParams) => (value: number[]) => {
      setImageParams((prev) => {
        const newParams = { ...prev, [param]: value[0] };
        if (JSON.stringify(newParams) !== JSON.stringify(prev)) {
          return newParams;
        }
        return prev;
      });
    };

  const handleDownload = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch("http://localhost:8080/api/images/final", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId,
          ...imageParams,
          format: downloadFormat,
          cropData,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `processed_image.${downloadFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Download failed");
      }
    } catch (error) {
      console.error("Error downloading image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetEdits = useCallback(() => {
    setImageParams(initialImageParams);
    setCropData(null);
    setIsEdited(false);
    processImage();
  }, [processImage]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Image</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <div className="relative w-full h-96 bg-gray-100 flex items-center justify-center overflow-hidden">
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
                key={previewUrl}
              />
            )}
          </div>
          <Button onClick={() => setIsCropping(true)} className="mt-4 mr-2">
            Crop Image
          </Button>
          <Button onClick={handleDownload} className="mt-4 mr-2">
            Download Processed Image
          </Button>
          <Button onClick={resetEdits} disabled={!isEdited} className="mt-4">
            Reset Edits
          </Button>
        </div>
        <div className="w-full md:w-1/3">
          {Object.entries(imageParams).map(([param, value]) => (
            <div key={param} className="mb-4">
              <label className="block mb-2 capitalize">
                {param}: {value.toFixed(2)}
              </label>
              <Slider
                min={param === "rotation" ? 0 : param === "contrast" ? 0 : 0}
                max={param === "rotation" ? 360 : param === "contrast" ? 2 : 2}
                step={param === "rotation" ? 1 : 0.01}
                value={[value]}
                onValueChange={handleSliderChange(
                  param as keyof typeof imageParams
                )}
              />
            </div>
          ))}
          <div className="mt-4">
            <label className="block mb-2">Download Format</label>
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value)}
              className="block w-full p-2 border rounded bg-black"
            >
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
            </select>
          </div>
        </div>
      </div>
      {isCropping && (
        <ImageCropper
          imageUrl={previewUrl || ""}
          onCropComplete={handleCropComplete}
          onClose={() => setIsCropping(false)}
        />
      )}
    </div>
  );
}
