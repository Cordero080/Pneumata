import React from "react";
import ReactDOM from "react-dom/client";
import { useGLTF } from "@react-three/drei";
import App from "./App";
import "./styles/main.scss";

useGLTF.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
