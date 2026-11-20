import { useSyncExternalStore } from "react";

/**
 * First-visit experience choice (full vs light). Stored once in localStorage; the light choice is applied through the
 * same switch as the footer's "reduce motion" toggle (MotionPreference). Visitors whose system already asks for
 * reduced motion are never asked (the system setting wins anyway).
 */
export const EXPERIENCE_KEY = "menuverse-experience";
const subscribers = new Set();

const stored = () => {
  try {
    return localStorage.getItem(EXPERIENCE_KEY);
  } catch {
    return "unavailable";
  }
};

const systemReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True when the chooser should be shown on this visit. */
export const needsExperienceChoice = () => !stored() && !systemReduced();

/** "full" | "light" | "dismissed" */
export function markExperienceChosen(choice) {
  try {
    localStorage.setItem(EXPERIENCE_KEY, choice);
  } catch {
    /* storage unavailable */
  }
  subscribers.forEach((fn) => fn());
}

/** True once there is nothing left to ask (chosen earlier, chosen now, or not needed). Other first-visit hints wait for it. */
export function useExperienceSettled() {
  return useSyncExternalStore(
    (cb) => {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    () => !needsExperienceChoice(),
    () => true,
  );
}

/**
 * Suggests the light experience on devices likely to struggle with WebGL and scroll effects: data saver on, little
 * memory, or few CPU cores. Only a recommendation; the visitor decides.
 */
export function recommendLight() {
  if (typeof navigator === "undefined") return false;
  if (navigator.connection?.saveData) return true;
  if (navigator.deviceMemory && navigator.deviceMemory <= 4) return true;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return true;
  return false;
}
