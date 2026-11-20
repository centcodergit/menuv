import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowUp, Lock, LockOpen, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { EmptyState, ErrorState, LangTag, LoadingState, SearchField, StatusPill, fullDate, shortTime } from "@/components/admin/shared";

const displayName = (c) => c?.user_name?.trim() || c?.user_email || "–";

function ConversationItem({ conversation: c, selected, onSelect, locale }) {
  const { t } = useI18n();
  const unread = Boolean(c.unread_by_admin);
  return (
    <li>
      <button
        type="button"
        data-conversation={c.id}
        aria-current={selected ? "true" : undefined}
        onClick={() => onSelect(c.id)}
        className={cn(
          "relative flex min-h-[44px] w-full flex-col gap-1 border-b border-mv-line px-4 py-3 text-left transition-colors hover:bg-mv-surface-2/70",
          selected && "bg-mv-violet-500/10 hover:bg-mv-violet-500/15",
        )}
      >
        {selected && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-mv-violet-400" />}
        <span className="flex w-full items-center gap-2">
          <span
            aria-hidden="true"
            data-unread-dot={unread || undefined}
            className={cn("h-2 w-2 shrink-0 rounded-full", unread ? "bg-mv-violet-400 shadow-[0_0_10px_rgb(var(--mv-violet-500)/0.8)]" : "bg-transparent")}
          />
          {unread && <span className="sr-only">{t("admin.unread")}: </span>}
          <span className={cn("min-w-0 flex-1 truncate text-[15px]", unread ? "font-semibold text-mv-text" : "font-medium text-mv-text")}>{displayName(c)}</span>
          <time dateTime={c.last_message_at} className="shrink-0 font-mono text-[11px] tabular-nums text-mv-muted">
            {shortTime(c.last_message_at ?? c.created_date, locale)}
          </time>
        </span>
        {c.user_name && <span className="truncate pl-4 text-xs text-mv-muted">{c.user_email}</span>}
        <span className="flex w-full items-center gap-2 pl-4">
          <span className={cn("min-w-0 flex-1 truncate text-sm", unread ? "text-mv-text" : "text-mv-muted")}>{c.last_message_preview || "…"}</span>
          {c.status === "closed" && <StatusPill status="closed" />}
        </span>
      </button>
    </li>
  );
}

function Bubble({ from, children, time, label }) {
  const team = from === "admin";
  return (
    <li className={cn("flex", team ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%]", team && "text-right")}>
        <span className="sr-only">{label}: </span>
        <p
          className={cn(
            "inline-block whitespace-pre-wrap break-words rounded-[18px] px-4 py-2.5 text-left text-[15px] leading-relaxed",
            team ? "rounded-br-md bg-gradient-to-b from-mv-violet-500 to-mv-violet-600 text-white" : "rounded-bl-md border border-mv-line bg-mv-surface-2 text-mv-text",
          )}
        >
          {children}
        </p>
        {time && <p className="mt-1 px-1 font-mono text-[10px] uppercase tracking-[0.08em] text-mv-muted">{time}</p>}
      </div>
    </li>
  );
}

function ReplyBox({ conversationId, onSend }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const area = useRef(null);

  useEffect(() => setText(""), [conversationId]);
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onSend(text);
      setText("");
    } catch {
      toast.error(t("chat.error"));
    } finally {
      setSending(false);
      area.current?.focus({ preventScroll: true });
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
      <label htmlFor="mv-admin-reply" className="sr-only">
        {t("admin.replyPlaceholder")}
      </label>
      <textarea
        id="mv-admin-reply"
        ref={area}
        rows={1}
        value={text}
        maxLength={4000}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={t("admin.replyPlaceholder")}
        className="min-h-[44px] flex-1 resize-none rounded-input border border-mv-line bg-mv-surface-2 px-4 py-2.5 text-[15px] text-mv-text placeholder:text-mv-muted focus:border-mv-violet-400/60"
      />
      <button type="submit" disabled={!text.trim() || sending} className="btn-primary h-11 w-11 shrink-0 !p-0 disabled:opacity-40 sm:w-auto sm:!px-5">
        <ArrowUp aria-hidden="true" size={18} strokeWidth={2} className="sm:hidden" />
        <span className="sr-only sm:not-sr-only">{t("admin.send")}</span>
      </button>
    </form>
  );
}

function Thread({ inbox, onBack, headingRef }) {
  const { t, locale } = useI18n();
  const { selected: c, messages, threadStatus, retryThread, send, setConversationStatus } = inbox;
  const list = useRef(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, c?.id]);

  if (!c) return null;
  const closed = c.status === "closed";
  const time = (iso) => fullDate(iso, locale);

  const toggle = async () => {
    setToggling(true);
    try {
      await setConversationStatus(c.id, closed ? "open" : "closed");
      toast.success(t("admin.saved"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-mv-line px-3 py-3 md:px-5">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("admin.tabs.inbox")}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-mv-muted hover:bg-mv-surface-2 hover:text-mv-text md:hidden"
        >
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 ref={headingRef} tabIndex={-1} className="truncate font-display text-lg font-semibold text-mv-text focus:outline-none">
            {displayName(c)}
          </h2>
          <p className="flex min-w-0 items-center gap-2 text-sm text-mv-muted">
            <a href={`mailto:${c.user_email}`} className="inline-flex min-w-0 items-center gap-1.5 hover:text-mv-text">
              <Mail aria-hidden="true" size={13} strokeWidth={1.75} className="shrink-0" />
              <span className="truncate">{c.user_email}</span>
            </a>
            <LangTag code={c.language} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={c.status} />
          <button type="button" onClick={toggle} disabled={toggling} className="btn-outline !min-h-[44px] !px-4 !py-2 text-sm">
            {closed ? <LockOpen aria-hidden="true" size={15} strokeWidth={1.75} /> : <Lock aria-hidden="true" size={15} strokeWidth={1.75} />}
            {closed ? t("admin.reopen") : t("admin.closeConversation")}
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        {threadStatus === "loading" && <LoadingState rows={3} />}
        {threadStatus === "error" && <ErrorState onRetry={retryThread} />}
        {threadStatus === "ready" && (
          <ol ref={list} data-lenis-prevent aria-live="polite" className="absolute inset-0 space-y-3 overflow-y-auto overscroll-contain px-4 py-5 md:px-6">
            {messages.length === 0 && (
              <li>
                <EmptyState />
              </li>
            )}
            {messages.map((m) => (
              <Bubble key={m.id} from={m.sender_role} time={time(m.created_date)} label={m.sender_role === "admin" ? t("chat.team") : displayName(c)}>
                {m.body}
              </Bubble>
            ))}
          </ol>
        )}
      </div>

      <ReplyBox conversationId={c.id} onSend={send} />
    </div>
  );
}

/**
 * Inbox tab: conversation list (search, unread dots, open/closed) beside the selected thread on
 * tablets and desktops; on phones the list and the thread take turns, with a back button.
 */
export default function InboxTab({ inbox }) {
  const { t, locale } = useI18n();
  const twoPane = useMediaQuery("(min-width: 768px)");
  const [query, setQuery] = useState("");
  const heading = useRef(null);
  const card = useRef(null);
  const listRef = useRef(null);
  const { conversations, status, retry, selectedId, select } = inbox;

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    if (!q) return conversations;
    return conversations.filter((c) => [c.user_name, c.user_email, c.last_message_preview].some((v) => v?.toLocaleLowerCase(locale).includes(q)));
  }, [conversations, query, locale]);

  const open = (id) => {
    select(id);
    if (twoPane) return;
    // Phones: the thread fills the card; bring the card to the top (under the navbar) and move focus to its heading.
    window.setTimeout(() => {
      card.current?.scrollIntoView({ block: "start" });
      heading.current?.focus({ preventScroll: true });
    }, 30);
  };
  const back = () => {
    const id = selectedId;
    select(null);
    window.setTimeout(() => listRef.current?.querySelector(`[data-conversation="${id}"]`)?.focus(), 30);
  };

  const showList = twoPane || !selectedId;
  const showThread = twoPane || Boolean(selectedId);

  return (
    <div
      ref={card}
      className="stone grid h-[calc(100svh-11.5rem)] min-h-[440px] scroll-mt-24 overflow-hidden rounded-card md:h-[clamp(480px,calc(100svh-24rem),800px)] md:grid-cols-[minmax(260px,340px)_1fr] lg:h-[clamp(480px,calc(100svh-20rem),800px)]"
    >
      {showList && (
        <div className="flex min-h-0 flex-col md:border-r md:border-mv-line">
          <div className="border-b border-mv-line p-3">
            <SearchField id="mv-admin-inbox-search" value={query} onChange={setQuery} />
          </div>
          <div className="relative min-h-0 flex-1">
            {status === "loading" && <LoadingState />}
            {status === "error" && <ErrorState onRetry={retry} />}
            {status === "ready" && filtered.length === 0 && <EmptyState />}
            {status === "ready" && filtered.length > 0 && (
              <ul ref={listRef} data-lenis-prevent aria-label={t("admin.tabs.inbox")} className="absolute inset-0 overflow-y-auto overscroll-contain">
                {filtered.map((c) => (
                  <ConversationItem key={c.id} conversation={c} selected={c.id === selectedId} onSelect={open} locale={locale} />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {showThread && (
        <div className="min-h-0 min-w-0">
          {inbox.selected ? (
            <Thread inbox={inbox} onBack={back} headingRef={heading} />
          ) : (
            <EmptyState className="h-full">{t("admin.selectConversation")}</EmptyState>
          )}
        </div>
      )}
    </div>
  );
}
