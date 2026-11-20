import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { listFeedback } from "@/api/admin";
import { EmptyState, ErrorState, LangTag, LoadingState, TableScroll, fullDate, rowClass, tdClass, thClass } from "@/components/admin/shared";

const LONG = 90;

function Stars({ value }) {
  const { t } = useI18n();
  const n = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <span className="inline-flex items-center gap-0.5" title={t("feedback.star", { n })}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden="true" size={15} strokeWidth={1.75} className={i <= n ? "fill-mv-champagne text-mv-champagne" : "text-mv-line-strong"} />
      ))}
      <span className="sr-only">{t("feedback.star", { n })}</span>
    </span>
  );
}

/** Long answers show two lines; the button expands them (and the full text is in the title for hover). */
function LongText({ text }) {
  const [open, setOpen] = useState(false);
  if (!text) return <span className="text-mv-muted">–</span>;
  if (text.length <= LONG) return <span className="whitespace-pre-wrap break-words">{text}</span>;
  return (
    <button
      type="button"
      aria-expanded={open}
      title={open ? undefined : text}
      onClick={() => setOpen((v) => !v)}
      className={cn("block w-full whitespace-pre-wrap break-words rounded-md text-left hover:text-mv-violet-200", !open && "line-clamp-2")}
    >
      {text}
    </button>
  );
}

export function YesNo({ value }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        value ? "border-mv-success/40 text-mv-success" : "border-mv-line-strong text-mv-muted",
      )}
    >
      {value ? t("feedback.yes") : t("feedback.no")}
    </span>
  );
}

/** Column header that sorts on click; aria-sort on the <th> tells screen readers the current order. */
export function SortHeader({ column, label, sort, onSort, className }) {
  const { t } = useI18n();
  const active = sort.key === column;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={cn(thClass, "p-0", className)}>
      <button
        type="button"
        onClick={() => onSort(column)}
        title={t("admin.sortBy", { column: label })}
        className={cn("inline-flex min-h-[44px] w-full items-center gap-1.5 px-4 py-3 uppercase hover:text-mv-text", active && "text-mv-violet-300")}
      >
        {label}
        <Icon aria-hidden="true" size={13} strokeWidth={1.75} className={cn(!active && "opacity-50")} />
      </button>
    </th>
  );
}

const DEFAULT_DIR = { name: "asc", rating: "desc", purchased: "desc", language: "asc", date: "desc" };

export default function FeedbackTab() {
  const { t, locale } = useI18n();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["admin", "Feedback"], queryFn: listFeedback });
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  const onSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: DEFAULT_DIR[key] }));

  const rows = useMemo(() => {
    const collator = new Intl.Collator(locale, { sensitivity: "base" });
    const value = {
      name: (r) => r.name ?? "",
      rating: (r) => Number(r.rating) || 0,
      purchased: (r) => (r.purchased_menu ? 1 : 0),
      language: (r) => r.language ?? "",
      date: (r) => r.created_date ?? "",
    }[sort.key];
    const cmp = (a, b) => {
      const x = value(a);
      const y = value(b);
      const base = typeof x === "number" ? x - y : sort.key === "date" ? (x < y ? -1 : x > y ? 1 : 0) : collator.compare(x, y);
      // Ties keep newest first.
      return base || ((b.created_date ?? "") < (a.created_date ?? "") ? -1 : 1) * (sort.dir === "asc" ? 1 : -1);
    };
    return [...(data ?? [])].sort((a, b) => cmp(a, b) * (sort.dir === "asc" ? 1 : -1));
  }, [data, sort, locale]);

  return (
    <div className="stone overflow-hidden rounded-card">
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} busy={isFetching} />}
      {data && data.length === 0 && <EmptyState />}
      {data && data.length > 0 && (
        <TableScroll>
          <table className="w-full min-w-[960px] border-collapse" data-admin-table="feedback">
            <thead>
              <tr>
                <SortHeader column="name" label={t("admin.col.name")} sort={sort} onSort={onSort} />
                <SortHeader column="rating" label={t("admin.col.rating")} sort={sort} onSort={onSort} />
                <SortHeader column="purchased" label={t("admin.col.purchased")} sort={sort} onSort={onSort} />
                <th scope="col" className={thClass}>
                  {t("admin.col.change")}
                </th>
                <th scope="col" className={thClass}>
                  {t("admin.col.feature")}
                </th>
                <SortHeader column="language" label={t("admin.col.language")} sort={sort} onSort={onSort} />
                <SortHeader column="date" label={t("admin.col.date")} sort={sort} onSort={onSort} />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={rowClass}>
                  <td className={cn(tdClass, "font-medium")}>{r.name || "–"}</td>
                  <td className={cn(tdClass, "whitespace-nowrap")} data-rating={r.rating}>
                    <Stars value={r.rating} />
                  </td>
                  <td className={tdClass}>
                    <YesNo value={r.purchased_menu} />
                  </td>
                  <td className={cn(tdClass, "w-[26%] min-w-[220px]")}>
                    <LongText text={r.change_request} />
                  </td>
                  <td className={cn(tdClass, "w-[26%] min-w-[220px]")}>
                    <LongText text={r.feature_request} />
                  </td>
                  <td className={tdClass}>
                    <LangTag code={r.language} />
                  </td>
                  <td className={cn(tdClass, "whitespace-nowrap font-mono text-xs tabular-nums text-mv-muted")}>
                    <time dateTime={r.created_date}>{fullDate(r.created_date, locale)}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      )}
    </div>
  );
}
