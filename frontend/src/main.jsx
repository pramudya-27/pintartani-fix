import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";

axios.defaults.baseURL = "https://daimyo27-pintartani-backend.hf.space";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
