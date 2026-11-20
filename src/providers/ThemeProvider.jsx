import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { flushSync } from "react-dom";

const STORAGE_KEY = "menuverse-theme";
const ThemeContext = createContext({ theme: "dark", setTheme: () => {}, toggleTheme: () => {} });

const readTheme = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");

const applyTheme = (next) => {
  const root = document.documentElement;
  root.classList.toggle("dark", next === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#050507" : "#FAFAF9");
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage unavailable */
  }
};

/**
 * Dark "Nocturne" is the default; light "Porcelain" via the toggle.
 * The class is first applied by the inline script in index.html (no flash).
 * WebGL scenes read `theme` and swap colour uniforms; they never re-mount.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readTheme);

  const setTheme = useCallback((next) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  /**
   * Toggle with a circular reveal from `origin` (an element or {x, y}) via the View Transitions API.
   * Falls back to an instant swap (Safari < 18, Firefox, reduced motion).
   */
  const toggleTheme = useCallback(
    (origin) => {
      const next = readTheme() === "dark" ? "light" : "dark";
      const reduce =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.documentElement.getAttribute("data-reduce-motion") === "true";

      if (!document.startViewTransition || reduce) {
        setTheme(next);
        return;
      }

      let x = window.innerWidth / 2;
      let y = 0;
      if (origin instanceof Element) {
        const r = origin.getBoundingClientRect();
        x = r.left + r.width / 2;
        y = r.top + r.height / 2;
      } else if (origin && typeof origin.x === "number") {
        ({ x, y } = origin);
      }
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      const transition = document.startViewTransition(() => {
        flushSync(() => setTheme(next));
      });
      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 700, easing: "cubic-bezier(0.76, 0, 0.24, 1)", pseudoElement: "::view-transition-new(root)" },
          );
        })
        .catch(() => {});
    },
    [setTheme],
  );

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
