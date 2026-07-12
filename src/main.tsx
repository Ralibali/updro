import { createRoot } from "react-dom/client";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import App from "./App.tsx";
import "./index.css";
import "./lib/publicFunctionRouting";
import { initAttribution } from "./lib/attribution";

// Capture first/latest-touch as early as possible so the very first landing
// is recorded even before the React router mounts.
initAttribution();

const rootEl = document.getElementById("root")!;

// The build writes SEO fallback HTML into #root for crawlers.
// It is not a React-rendered tree, so hydrating it can leave visitors stuck on the fallback.
// Always clear the fallback and mount the real app for users.
rootEl.replaceChildren();
createRoot(rootEl).render(<App />);
