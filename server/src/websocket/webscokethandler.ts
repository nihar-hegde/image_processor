import { WebSocket } from "ws";
import { processImage } from "../controllers/imageController";

const clients = new Map<string, WebSocket>();

export function handleWebSocketMessage(ws: WebSocket, data: any) {
  switch (data.type) {
    case "init":
      clients.set(data.imageId, ws);
      break;
    case "imageEdit":
      handleImageEdit(data);
      break;
  }
}

async function handleImageEdit(data: any) {
  const { imageId, ...editParams } = data;
  try {
    const result = await processImage(imageId, editParams);
    if (result && result.previewUrl) {
      const ws = clients.get(imageId);
      if (ws) {
        ws.send(
          JSON.stringify({
            type: "previewUpdate",
            previewUrl: result.previewUrl,
          })
        );
      }
    } else {
      throw new Error("Failed to process image");
    }
  } catch (error) {
    console.error("Error processing image:", error);
    const ws = clients.get(imageId);
    if (ws) {
      ws.send(
        JSON.stringify({ type: "error", message: "Error processing image" })
      );
    }
  }
}

export function removeClient(imageId: string) {
  clients.delete(imageId);
}
