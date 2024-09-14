import React, { createContext, useState, useContext } from "react";

interface ImageContextType {
  imageId: string | null;
  setImageId: (id: string | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider = ({ children }: { children: React.ReactNode }) => {
  const [imageId, setImageId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <ImageContext.Provider
      value={{ imageId, setImageId, previewUrl, setPreviewUrl }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error("useImage must be used within an ImageProvider");
  }
  return context;
};
