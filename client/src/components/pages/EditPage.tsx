import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useImage } from "@/context/imageContext";
import { Slider } from "../ui/slider";
import { debounce } from "lodash";
import { Loader2 } from "lucide-react";

export default function EditPage() {
  const { imageId, previewUrl, setPreviewUrl } = useImage();
  const [imageParams, setImageParams] = useState({
    brightness: 1,
    contrast: 1,
    saturation: 1,
    rotation: 0,
  });
  const [downloadFormat, setDownloadFormat] = useState("jpg");
  const [isProcessing, setIsProcessing] = useState(false);
  const prevParamsRef = useRef(imageParams);

  const processImage = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await fetch("http://localhost:8080/api/images/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId,
          ...imageParams,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewUrl(
          "http://localhost:8080" +
            data.previewUrl +
            "?t=" +
            new Date().getTime()
        );
      } else {
        throw new Error("Processing failed");
      }
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [imageId, imageParams, setPreviewUrl, isProcessing]);

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
          brightness: imageParams.brightness,
          contrast: imageParams.contrast,
          saturation: imageParams.saturation,
          rotation: imageParams.rotation,
          format: downloadFormat,
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
      // You might want to show an error message to the user here
    } finally {
      setIsProcessing(false);
    }
  };

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
        </div>
      </div>
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
      <Button onClick={handleDownload} className="mt-4">
        Download Processed Image
      </Button>
    </div>
  );
}
