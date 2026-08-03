import { StrictMode } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App, { preload } from "./App";
import "./theme.css";

const el = document.getElementById("root")!;
const tree = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Load the current page's module before hydrating so prerendered markup matches.
preload(window.location.pathname.replace(/\/$/, "") || "/").then(() => {
  if (el.hasChildNodes()) hydrateRoot(el, tree);
  else createRoot(el).render(tree);
});
