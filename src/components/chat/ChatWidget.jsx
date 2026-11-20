import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";
import { useIntroDone } from "@/lib/intro";
import { useChatOpenRequests } from "@/lib/chatBus";

const ChatController = lazy(() => import("@/components/chat/ChatController"));
const GREETED_KEY = "mv-chat-greeted";

/**
 * Floating chat button (master prompt 6.6), bottom-right on every public page: obsidian glass circle with
 * a slow orbiting light on its border (CSS conic gradient; see DECISIONS for why not a WebGL PulsingBorder),
 * unread badge, and a greeting bubble 4s after load, once per session.
 * Opens from: this button, the greeting, openChat() (support section, pricing, legal pages), ?chat=open.
 * The panel and its data layer load lazily (first open, hover, or as soon as the visitor is signed in for the badge).
 */
export default function ChatWidget() {
  const t = useT();
  const { isAuthenticated } = useAuth();
  const introDone = useIntroDone();
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [unread, setUnread] = useState(0);
  const [prefill, setPrefill] = useState("");
  const [greeting, setGreeting] = useState(false);

  const openChat = useCallback(({ message } = {}) => {
    if (message) setPrefill(message);
    setGreeting(false);
    setLoad(true);
    setOpen(true);
  }, []);
  useChatOpenRequests(openChat);

  useEffect(() => {
    if (isAuthenticated) setLoad(true);
  }, [isAuthenticated]);

  // Returning from sign-in with ?redirect=chat lands on ?chat=open.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("chat") !== "open") return;
    params.delete("chat");
    const query = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    openChat();
  }, [openChat]);

  useEffect(() => {
    if (!introDone) return undefined;
    try {
      if (sessionStorage.getItem(GREETED_KEY)) return undefined;
    } catch {
      return undefined;
    }
    const id = window.setTimeout(() => {
      setGreeting(true);
      try {
        sessionStorage.setItem(GREETED_KEY, "1");
      } catch {
        /* storage unavailable */
      }
    }, 4000);
    return () => window.clearTimeout(id);
  }, [introDone]);

  const onPrefillUsed = useCallback(() => setPrefill(""), []);
  const label = unread > 0 ? `${t("chat.open")}, ${t("chat.unread", { count: unread })}` : t("chat.open");

  return (
    <>
      <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-chat flex items-end gap-3">
        {greeting && !open && (
          <div
            className="glass pointer-events-auto relative mb-1 flex max-w-[min(18rem,calc(100vw-7rem))] items-start gap-2 rounded-[18px] rounded-br-md py-3 pl-4 pr-2 animate-in fade-in slide-in-from-right-6 duration-700"
            style={{ animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            <button type="button" onClick={() => openChat()} className="text-left text-sm leading-relaxed text-mv-text">
              {t("chat.greeting")}
            </button>
            <button
              type="button"
              onClick={() => setGreeting(false)}
              aria-label={t("nav.close")}
              className="-mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-mv-muted hover:text-mv-text"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openChat())}
          onPointerEnter={() => setLoad(true)}
          onFocus={() => setLoad(true)}
          aria-label={label}
          aria-expanded={open}
          tabIndex={open ? -1 : 0}
          className={`group relative h-14 w-14 shrink-0 rounded-full transition-[opacity,transform] duration-300 ease-mv-out ${open ? "pointer-events-none scale-75 opacity-0" : "pointer-events-auto"}`}
        >
          <span
            aria-hidden="true"
            className="absolute -inset-px rounded-full motion-safe:animate-[spin_8s_linear_infinite]"
            style={{
              background: "conic-gradient(from 0deg, transparent 0 62%, rgba(196,181,253,0.95) 78%, rgba(139,92,246,0.9) 84%, transparent 92%)",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px))",
            }}
          />
          <span className="glass absolute inset-[1px] flex items-center justify-center rounded-full transition-transform duration-300 ease-mv-spring group-hover:scale-105">
            <MessageCircle size={22} strokeWidth={1.5} className="text-mv-text" />
          </span>
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-mv-violet-500 px-1 font-mono text-[11px] font-semibold text-white shadow-[0_0_12px_rgba(139,92,246,0.8)] animate-in zoom-in-50 duration-300"
            >
              {unread}
            </span>
          )}
        </button>
      </div>

      {load && (
        <Suspense fallback={null}>
          <ChatController open={open} onOpenChange={setOpen} onUnread={setUnread} prefill={prefill} onPrefillUsed={onPrefillUsed} />
        </Suspense>
      )}
    </>
  );
}
