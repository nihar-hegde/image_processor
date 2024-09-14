import { BrowserRouter, Route, Routes } from "react-router-dom";
import ImageUploader from "./components/main/image-uploader";
import { ImageProvider } from "./context/imageContext";
import EditPage from "./components/pages/EditPage";

function App() {
  return (
    <ImageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ImageUploader />} />
          <Route path="/edit" element={<EditPage />} />
        </Routes>
      </BrowserRouter>
    </ImageProvider>
  );
}

export default App;
