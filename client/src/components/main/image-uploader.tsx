import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useImage } from "@/context/imageContext";

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const { setImageId, setPreviewUrl } = useImage();
  const navigate = useNavigate();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG or PNG image file.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const uploadImage = async () => {
    if (!image) {
      toast({
        title: "No image selected",
        description: "Please select an image before uploading.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setImageId(data.imageId);
        setPreviewUrl("http://localhost:8080" + data.previewUrl);
        navigate("/edit");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error during upload:", error);
      toast({
        title: "Upload failed",
        description:
          error.message || "There was an error uploading your image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    multiple: false,
  });

  const handleDelete = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Image Uploader</CardTitle>
          <CardDescription>
            Drag and drop or click to upload a JPG or PNG image
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card
            {...getRootProps()}
            className={`p-4 border-dashed border-2 ${
              isDragActive ? "border-primary" : "border-muted-foreground"
            } cursor-pointer transition-colors`}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {isDragActive
                    ? "Drop the JPG or PNG image here"
                    : "Drag and drop a JPG or PNG image here, or click to select"}
                </p>
              </div>
            )}
          </Card>
        </CardContent>
        <CardFooter className="flex justify-between">
          {image ? (
            <>
              <p className="text-sm text-muted-foreground">
                {image.name} - {(image.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="space-x-2">
                <Button variant="outline" onClick={handleDelete}>
                  Remove
                </Button>
                <Button
                  onClick={uploadImage}
                  disabled={isUploading}
                  className="rounded-md"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No image selected</p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
