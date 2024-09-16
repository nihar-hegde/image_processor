import { BrowserRouter, Route, Routes } from "react-router-dom";
import ImageUploader from "./components/main/image-uploader";
import { ImageProvider } from "./context/imageContext";
import EditPage from "./components/pages/EditPage";
import { WebSocketProvider } from "./context/websocketContext";

function App() {
  return (
    <ImageProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ImageUploader />} />
            <Route path="/edit" element={<EditPage />} />
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </ImageProvider>
  );
}

export default App;
