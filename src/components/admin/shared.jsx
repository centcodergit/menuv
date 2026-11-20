import { RotateCw, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/lib/languages";

/* ---------- Dates ---------- */

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Inbox list time: today → 14:05, this year → 20 Νοε, older → 20/11/25. */
export function shortTime(iso, locale) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (sameDay(d, now)) return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(d);
  if (d.getFullYear() === now.getFullYear()) return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d);
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "2-digit" }).format(d);
}

/** Table dates: 20 Νοε 2026, 14:05 (time optional). */
export function fullDate(iso, locale, withTime = true) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(d);
}

/* ---------- Small pieces ---------- */

export function LangTag({ code }) {
  if (!code) return <span className="text-mv-muted">–</span>;
  const label = LANGUAGES.find((l) => l.code === code)?.label ?? code;
  return (
    <span title={label} className="inline-flex rounded-md border border-mv-line px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-mv-muted">
      <span aria-hidden="true">{code}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function StatusPill({ status, className }) {
  const { t } = useI18n();
  const open = status !== "closed";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
        open ? "border-mv-success/40 text-mv-success" : "border-mv-line-strong text-mv-muted",
        className,
      )}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-[2px] bg-current" />
      {open ? t("admin.open") : t("admin.closed")}
    </span>
  );
}

export function SearchField({ value, onChange, className, id }) {
  const { t } = useI18n();
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {t("admin.search")}
      </label>
      <Search aria-hidden="true" size={16} strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mv-muted" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("admin.search")}
        autoComplete="off"
        className="h-11 w-full rounded-input border border-mv-line bg-mv-surface-2 pl-10 pr-4 text-[15px] text-mv-text placeholder:text-mv-muted focus:border-mv-violet-400/60"
      />
    </div>
  );
}

/* ---------- Loading / empty / error ---------- */

export function LoadingState({ rows = 4, className }) {
  const { t } = useI18n();
  return (
    <div role="status" className={cn("space-y-3 p-5", className)}>
      <span className="sr-only">{t("common.loading")}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden="true" className="h-11 animate-pulse rounded-inner bg-mv-surface-2" style={{ opacity: 1 - i * 0.18 }} />
      ))}
    </div>
  );
}

export function EmptyState({ children, className }) {
  const { t } = useI18n();
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-14 text-center", className)}>
      <span aria-hidden="true" className="grid grid-cols-3 gap-1 opacity-60">
        {[1, 0, 1, 0, 1, 0, 1, 0, 1].map((on, i) => (
          <span key={i} className={cn("h-2 w-2 rounded-[2px]", on ? "bg-mv-violet-400/70" : "bg-mv-line-strong")} />
        ))}
      </span>
      <p className="text-sm text-mv-muted">{children ?? t("admin.empty")}</p>
    </div>
  );
}

export function ErrorState({ onRetry, busy, className }) {
  const { t } = useI18n();
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center gap-4 px-6 py-14 text-center", className)}>
      <p className="text-mv-muted">{t("common.error")}</p>
      <button type="button" onClick={onRetry} disabled={busy} className="btn-outline">
        <RotateCw aria-hidden="true" size={16} strokeWidth={1.75} className={cn(busy && "animate-spin")} />
        {t("common.retry")}
      </button>
    </div>
  );
}

/* ---------- Tables ---------- */

/** Horizontal scroll lives inside the card (Lenis ignores it), so a wide table never widens the page. */
export function TableScroll({ children, className }) {
  return (
    <div data-lenis-prevent className={cn("overflow-x-auto overscroll-x-contain", className)}>
      {children}
    </div>
  );
}

export const thClass = "whitespace-nowrap px-4 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-mv-muted";
export const tdClass = "px-4 py-3 align-top text-sm text-mv-text";
export const rowClass = "border-t border-mv-line transition-colors hover:bg-mv-surface-2/60";
