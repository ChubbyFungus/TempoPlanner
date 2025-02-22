import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { TempoDevtools } from "tempo-devtools";

// Add console log for debugging
console.log("Starting application...");

// Initialize Tempo Devtools
TempoDevtools.init();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
