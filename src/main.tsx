import React from "react";
import ReactDOM from "react-dom/client";
import VanquishApp from "./vanquish/App";
import "./vanquish/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <VanquishApp />
  </React.StrictMode>,
);
