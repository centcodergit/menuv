import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "menuverse-reduce-motion";
const QUERY = "(prefers-reduced-motion: reduce)";

const MotionPreferenceContext = createContext({ reduced: false, manual: false, setManual: () => {} });

const readManual = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

/**
 * Reduced motion = the OS setting OR the footer "Reduce motion" toggle.
 * Mirrors the result on <html data-reduce-motion> so CSS can react too.
 */
export function MotionPreferenceProvider({ children }) {
  const [system, setSystem] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(QUERY).matches : false,
  );
  const [manual, setManualState] = useState(readManual);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => setSystem(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setManual = useCallback((next) => {
    setManualState(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const reduced = system || manual;

  useEffect(() => {
    const root = document.documentElement;
    if (reduced) root.setAttribute("data-reduce-motion", "true");
    else root.removeAttribute("data-reduce-motion");
  }, [reduced]);

  const value = useMemo(() => ({ reduced, system, manual, setManual }), [reduced, system, manual, setManual]);
  return <MotionPreferenceContext.Provider value={value}>{children}</MotionPreferenceContext.Provider>;
}

export const useMotionPreference = () => useContext(MotionPreferenceContext);
