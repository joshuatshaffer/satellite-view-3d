import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { initAr } from "./arOverlay.ts";
import { initCameraPassthrough } from "./cameraPassthrough.ts";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

initCameraPassthrough(
  document.getElementById("camera-passthrough") as HTMLVideoElement
);
initAr(
  document.getElementById("ar-canvas") as HTMLCanvasElement,
  document.getElementById("ar-dom") as HTMLDivElement
);
