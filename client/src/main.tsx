import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "./components/ui/toaster.tsx";
import { ImageProvider } from "./context/imageContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ImageProvider>
      <Toaster />
      <App />
    </ImageProvider>
  </StrictMode>
);
