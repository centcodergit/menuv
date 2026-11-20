import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { listSubscribers } from "@/api/admin";
import { downloadCsv, toCsv, today } from "@/components/admin/csv";
import { EmptyState, ErrorState, LangTag, LoadingState, SearchField, TableScroll, fullDate, rowClass, tdClass, thClass } from "@/components/admin/shared";

const dateOf = (r) => r.consent_at ?? r.created_date;

export default function NewsletterTab() {
  const { t, locale } = useI18n();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["admin", "NewsletterSubscriber"], queryFn: listSubscribers });
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...(data ?? [])].sort((a, b) => ((dateOf(a) ?? "") < (dateOf(b) ?? "") ? 1 : -1));
    return q ? list.filter((r) => [r.email, r.source, r.language].some((v) => v?.toLowerCase().includes(q))) : list;
  }, [data, query]);

  // Exports what the table shows (all subscribers, or the search result).
  const exportCsv = () => {
    const header = [t("admin.col.email"), t("admin.col.language"), t("admin.col.source"), t("admin.col.date")];
    const body = rows.map((r) => [r.email, r.language ?? "", r.source ?? "", dateOf(r) ?? ""]);
    downloadCsv(`menuverse-newsletter-${today()}.csv`, toCsv(header, body));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField id="mv-admin-newsletter-search" value={query} onChange={setQuery} className="sm:max-w-sm sm:flex-1" />
        <p className="font-mono text-label uppercase text-mv-muted sm:ml-auto" aria-live="polite">
          {t("admin.subscribers", { n: data ? rows.length : 0 })}
        </p>
        <button type="button" onClick={exportCsv} disabled={!rows.length} className="btn-outline disabled:opacity-40" data-admin-export>
          <Download aria-hidden="true" size={16} strokeWidth={1.75} />
          {t("admin.exportCsv")}
        </button>
      </div>

      <div className="stone overflow-hidden rounded-card">
        {isLoading && <LoadingState />}
        {isError && <ErrorState onRetry={() => refetch()} busy={isFetching} />}
        {data && rows.length === 0 && <EmptyState />}
        {data && rows.length > 0 && (
          <TableScroll>
            <table className="w-full min-w-[620px] border-collapse" data-admin-table="newsletter">
              <thead>
                <tr>
                  <th scope="col" className={thClass}>
                    {t("admin.col.email")}
                  </th>
                  <th scope="col" className={thClass}>
                    {t("admin.col.language")}
                  </th>
                  <th scope="col" className={thClass}>
                    {t("admin.col.source")}
                  </th>
                  <th scope="col" className={thClass}>
                    {t("admin.col.date")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={rowClass}>
                    <td className={cn(tdClass, "font-medium")}>
                      <a href={`mailto:${r.email}`} className="break-all hover:text-mv-violet-200">
                        {r.email}
                      </a>
                    </td>
                    <td className={tdClass}>
                      <LangTag code={r.language} />
                    </td>
                    <td className={cn(tdClass, "text-mv-muted")}>{r.source || "–"}</td>
                    <td className={cn(tdClass, "whitespace-nowrap font-mono text-xs tabular-nums text-mv-muted")}>
                      <time dateTime={dateOf(r)}>{fullDate(dateOf(r), locale)}</time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </div>
    </div>
  );
}
