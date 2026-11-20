import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import "@/lib/gsap";
import { detectLanguage } from "@/lib/languages";
import { loadDictionary } from "@/lib/i18n";

// The app owns scroll position (Lenis + route transitions + hash deep links), not the browser.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

// Load the visitor's dictionary before the first render, so non-Greek visitors never see a flash of Greek.
const lang = detectLanguage();

loadDictionary(lang)
  .catch(() => null)
  .then(() => {
    ReactDOM.createRoot(document.getElementById("root")).render(<App initialLang={lang} />);
  });
