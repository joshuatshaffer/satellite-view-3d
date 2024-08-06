if (process.env.NODE_ENV === "development") {
  import("eruda").then(({ default: eruda }) => eruda.init());
}

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
