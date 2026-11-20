import { useSyncExternalStore } from "react";

/**
 * Intro state shared by the preloader and the hero (master prompt 6.1): the preloader marks the intro
 * "done" the moment its reveal starts, so the hero entrance hands off from it as one continuous move.
 * If no preloader plays (seen this session, reduced motion, deep page), the intro is done immediately.
 */
const SEEN_KEY = "mv-intro-seen";
let done = false;
const subscribers = new Set();

export function shouldPlayIntro({ reduced, pathname }) {
  if (reduced || pathname !== "/") return false;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return false;
  }
}

export function markIntroDone({ remember = false } = {}) {
  if (remember) {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  }
  if (done) return;
  done = true;
  subscribers.forEach((fn) => fn());
}

export const isIntroDone = () => done;

/** True once the preloader has handed off (or immediately when there is none). */
export function useIntroDone() {
  return useSyncExternalStore(
    (cb) => {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    () => done,
    () => true,
  );
}
