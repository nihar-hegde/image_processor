import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { useImage } from "@/context/imageContext";
import { Slider } from "../ui/slider";

export default function EditPage() {
  const { imageId, previewUrl, setPreviewUrl } = useImage();
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleProcess = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/images/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId,
          brightness,
          contrast,
          saturation,
          rotation,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewUrl(data.previewUrl);
      } else {
        throw new Error("Processing failed");
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Image</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <img src={previewUrl || ""} alt="Preview" className="w-full h-auto" />
        </div>
        <div className="w-full md:w-1/3">
          <div className="mb-4">
            <label className="block mb-2">Brightness</label>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={[brightness]}
              onValueChange={([value]) => setBrightness(value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Contrast</label>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={[contrast]}
              onValueChange={([value]) => setContrast(value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Saturation</label>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={[saturation]}
              onValueChange={([value]) => setSaturation(value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Rotation</label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[rotation]}
              onValueChange={([value]) => setRotation(value)}
            />
          </div>
          <Button onClick={handleProcess}>Apply Changes</Button>
        </div>
      </div>
    </div>
  );
}
