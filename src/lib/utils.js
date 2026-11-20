import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's default font sizes, so it read the custom ones (text-h2, text-lead,
 * text-label, ...) as colours and dropped them whenever a text-mv-* colour was also present. Registering them as
 * font sizes keeps both.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["h1", "h2", "h3", "lead", "body", "body-lg", "label"] }],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const isIframe = typeof window !== "undefined" && window.self !== window.top;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
