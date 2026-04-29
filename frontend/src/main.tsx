import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root")!;
// Hydrate only for real React prerendered output (marked with data-react-snap).
// The build-time SEO prerender writes a semantic-HTML shell that does NOT
// correspond to the React tree, so we unmount it and fresh-render instead.
if (rootEl.hasAttribute("data-react-snap")) {
  hydrateRoot(rootEl, <App />);
} else {
  // Clear any prerendered SEO shell before React mounts to avoid a visible flash.
  if (rootEl.hasChildNodes()) rootEl.innerHTML = "";
  createRoot(rootEl).render(<App />);
}
