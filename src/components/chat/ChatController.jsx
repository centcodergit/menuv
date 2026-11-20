import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ArrowUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useSupportChat } from "@/hooks/useSupportChat";
import { usePageTransition } from "@/providers/PageTransition";
import { LogoMark } from "@/components/nav/Logo";

const SPRING = { animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" };
const DRAFT_KEY = "mv-chat-draft";

function Avatar() {
  return (
    <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-mv-line bg-mv-surface-2">
      <LogoMark className="h-5 w-5" />
      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-mv-void">
        <span className="absolute h-2 w-2 rounded-full bg-mv-success motion-safe:animate-ping-slow" />
        <span className="h-2 w-2 rounded-full bg-mv-success" />
      </span>
    </span>
  );
}

function Bubble({ from, children, time, label }) {
  const mine = from === "user";
  return (
    <li className={cn("flex animate-in fade-in slide-in-from-bottom-3 duration-500", mine ? "justify-end" : "justify-start")} style={SPRING}>
      <div className={cn("max-w-[85%]", mine && "text-right")}>
        <span className="sr-only">{label}: </span>
        <p
          className={cn(
            "inline-block whitespace-pre-wrap break-words rounded-[18px] px-4 py-2.5 text-left text-[15px] leading-relaxed",
            mine ? "rounded-br-md bg-gradient-to-b from-mv-violet-500 to-mv-violet-600 text-white" : "rounded-bl-md border border-mv-line bg-mv-surface-2 text-mv-text",
          )}
        >
          {children}
        </p>
        {time && <p className="mt-1 px-1 font-mono text-[10px] uppercase tracking-[0.08em] text-mv-muted">{time}</p>}
      </div>
    </li>
  );
}

function Composer({ initial, onSend, disabled }) {
  const { t } = useI18n();
  const [text, setText] = useState(initial);
  const [state, setState] = useState("idle");
  const area = useRef(null);

  useEffect(() => setText(initial), [initial]);
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  const submit = async () => {
    if (!text.trim() || state === "sending") return;
    setState("sending");
    try {
      await onSend(text);
      setText("");
      setState("sent");
      window.setTimeout(() => setState("idle"), 1200);
    } catch {
      setState("idle");
      toast.error(t("chat.error"));
    }
  };

  return (
    <form
      className="flex items-end gap-2 border-t border-mv-line p-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="sr-only" htmlFor="mv-chat-input">{t("chat.placeholder")}</label>
      <textarea
        id="mv-chat-input"
        ref={area}
        rows={1}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={t("chat.placeholder")}
        className="min-h-[44px] flex-1 resize-none rounded-input border border-mv-line bg-mv-surface-2 px-4 py-2.5 text-[15px] text-mv-text placeholder:text-mv-muted focus:border-mv-violet-400/60 focus:outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim() || state === "sending"}
        aria-label={t("chat.send")}
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-mv-violet-500 to-mv-violet-600 text-white shadow-[0_8px_24px_-8px_rgba(139,92,246,0.7)] transition-[opacity,transform] disabled:opacity-40"
      >
        <ArrowUp
          size={18}
          strokeWidth={2}
          className={cn("absolute transition-all duration-300 ease-mv-spring", state === "sent" ? "scale-50 opacity-0" : "scale-100 opacity-100", state === "sending" && "-translate-y-1 opacity-60")}
        />
        <Check size={18} strokeWidth={2.25} className={cn("absolute transition-all duration-300 ease-mv-spring", state === "sent" ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
      </button>
    </form>
  );
}

/**
 * Support chat panel (master prompt 3.6 / 6.6): right sheet (420px) on desktop, full screen on mobile.
 * Signed out: sign-in prompt (draft kept for after sign-in). Signed in: the customer's live thread.
 * Loaded lazily by ChatWidget the first time it is needed; reports the unread count back for the badge.
 */
export default function ChatController({ open, onOpenChange, onUnread, prefill, onPrefillUsed }) {
  const { t, lang, locale } = useI18n();
  const { transitionTo } = usePageTransition();
  const { isAuthenticated, messages, status, unread, send } = useSupportChat({ open, lang });
  const list = useRef(null);
  const [draft, setDraft] = useState("");

  useEffect(() => onUnread(unread), [unread, onUnread]);

  // A prefilled message (pricing CTAs) or a draft saved before signing in.
  useEffect(() => {
    if (prefill) {
      setDraft(prefill);
      onPrefillUsed();
      return;
    }
    if (isAuthenticated) {
      try {
        const saved = sessionStorage.getItem(DRAFT_KEY);
        if (saved) {
          setDraft(saved);
          sessionStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        /* storage unavailable */
      }
    }
  }, [prefill, onPrefillUsed, isAuthenticated]);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: messages.length > 1 ? "smooth" : "auto" });
  }, [messages.length, open]);

  const time = (iso) => (iso ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : null);

  const signIn = () => {
    try {
      if (draft) sessionStorage.setItem(DRAFT_KEY, draft);
    } catch {
      /* storage unavailable */
    }
    onOpenChange(false);
    transitionTo("/login?redirect=chat");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-[100dvh] !w-full flex-col gap-0 !p-0 sm:!max-w-[420px] sm:border-l sm:border-mv-line"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          window.setTimeout(() => document.getElementById("mv-chat-input")?.focus(), 80);
        }}
      >
        <header className="flex items-center gap-3 border-b border-mv-line px-5 py-4 pr-16">
          <Avatar />
          <div>
            <SheetTitle className="font-display text-base font-semibold text-mv-text">{t("chat.name")}</SheetTitle>
            <SheetDescription className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-mv-success">
              {t("chat.online")}
            </SheetDescription>
          </div>
        </header>

        <ol ref={list} data-lenis-prevent aria-live="polite" className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-5">
          <Bubble from="admin" label={t("chat.team")}>{t("chat.greeting")}</Bubble>
          {isAuthenticated &&
            messages.map((m) => (
              <Bubble key={m.id} from={m.sender_role} time={time(m.created_date)} label={m.sender_role === "user" ? t("chat.you") : t("chat.team")}>
                {m.body}
              </Bubble>
            ))}
          {isAuthenticated && status === "ready" && messages.length === 0 && (
            <li className="px-1 pt-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-mv-muted">{t("chat.empty")}</li>
          )}
        </ol>

        {isAuthenticated ? (
          <Composer initial={draft} onSend={send} disabled={status === "loading" || status === "error"} />
        ) : (
          <div className="space-y-3 border-t border-mv-line p-5">
            <p className="text-sm text-mv-muted">{t("chat.signInRequired")}</p>
            <button type="button" onClick={signIn} className="btn-primary w-full">
              {t("chat.signIn")}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
