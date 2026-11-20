import { useEffect } from "react";

/**
 * Tiny event bus for the support chat (master prompt 3.6). Anything can ask the chat panel to open,
 * optionally with a prefilled first message (pricing CTAs, legal pages' "Open Message System").
 * The chat panel (Phase 4) listens with useChatOpenRequests().
 */
const EVENT = "mv:chat-open";

export function openChat({ message } = {}) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message } }));
}

export function useChatOpenRequests(handler) {
  useEffect(() => {
    const listener = (e) => handler(e.detail ?? {});
    window.addEventListener(EVENT, listener);
    return () => window.removeEventListener(EVENT, listener);
  }, [handler]);
}
