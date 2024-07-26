import eruda from "eruda";

eruda.init();

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { initAr } from "./arOverlay.ts";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

initAr(
  document.getElementById("ar-canvas") as HTMLCanvasElement,
  document.getElementById("ar-dom") as HTMLDivElement
);
