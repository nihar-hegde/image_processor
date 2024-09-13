import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type.startsWith("image/")) {
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: false,
  });

  const handleDelete = () => {
    setImage(null);
    setPreview(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Image Uploader</CardTitle>
        <CardDescription>
          Drag and drop or click to upload an image
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
                  ? "Drop the image here"
                  : "Drag and drop an image here, or click to select"}
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
            <Button variant="outline" onClick={handleDelete}>
              Remove
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No image selected</p>
        )}
      </CardFooter>
    </Card>
  );
}
