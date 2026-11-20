import { Fragment, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { listReferrals, updateReferral } from "@/api/admin";
import { EmptyState, ErrorState, LoadingState, TableScroll, fullDate, rowClass, tdClass, thClass } from "@/components/admin/shared";

const KEY = ["admin", "Referral"];
const STATUSES = ["pending", "earned", "redeemed"];
const STATUS_STYLE = {
  pending: "border-mv-line-strong text-mv-muted",
  earned: "border-mv-violet-400/60 bg-mv-violet-500/15 text-mv-violet-200",
  redeemed: "border-mv-success/50 bg-mv-success/10 text-mv-success",
};

function Friends({ referral, onToggle, busy }) {
  const { t, locale } = useI18n();
  const signups = referral.signups ?? [];
  if (!signups.length) return <EmptyState className="py-6" />;
  return (
    <ul className="divide-y divide-mv-line rounded-inner border border-mv-line bg-mv-surface-2/50">
      {signups.map((s, i) => (
        <li key={`${s.email}-${i}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1.5">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-mv-text">{s.name || s.email}</span>
            {s.name && <span className="block truncate text-xs text-mv-muted">{s.email}</span>}
          </span>
          <time dateTime={s.signed_up_at} className="font-mono text-xs tabular-nums text-mv-muted">
            {fullDate(s.signed_up_at, locale, false)}
          </time>
          <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-mv-text">
            <input
              type="checkbox"
              checked={Boolean(s.has_purchased)}
              disabled={busy}
              onChange={(e) => onToggle(i, e.target.checked)}
              data-purchased={i}
              className="h-5 w-5 cursor-pointer rounded accent-[rgb(var(--mv-violet-500))]"
            />
            {t("admin.purchasedMark")}
            <span className="sr-only">: {s.name || s.email}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

/** Referrals: one row per referrer; friends expand underneath with a per-friend "purchased" box; reward status is editable. */
export default function ReferralsTab() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: KEY, queryFn: listReferrals });
  const [expanded, setExpanded] = useState(() => new Set());
  const [saving, setSaving] = useState(() => new Set());

  const toggleExpanded = (id) =>
    setExpanded((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Optimistic write: the row changes at once, rolls back (with an error toast) if the save fails.
  const save = async (id, patch) => {
    const previous = queryClient.getQueryData(KEY);
    queryClient.setQueryData(KEY, (list) => list?.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSaving((s) => new Set(s).add(id));
    try {
      const row = await updateReferral(id, patch);
      if (row?.id) queryClient.setQueryData(KEY, (list) => list?.map((r) => (r.id === id ? { ...r, ...row } : r)));
      toast.success(t("admin.saved"));
    } catch {
      queryClient.setQueryData(KEY, previous);
      toast.error(t("common.error"));
    } finally {
      setSaving((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  };

  const togglePurchased = (referral, index, checked) => {
    const signups = (referral.signups ?? []).map((s, i) => (i === index ? { ...s, has_purchased: checked } : s));
    save(referral.id, { signups });
  };

  return (
    <div className="stone overflow-hidden rounded-card">
      {isLoading && <LoadingState />}
      {isError && <ErrorState onRetry={() => refetch()} busy={isFetching} />}
      {data && data.length === 0 && <EmptyState />}
      {data && data.length > 0 && (
        <TableScroll>
          <table className="w-full min-w-[760px] border-collapse" data-admin-table="referrals">
            <thead>
              <tr>
                <th scope="col" className={thClass}>
                  {t("admin.col.referrer")}
                </th>
                <th scope="col" className={thClass}>
                  {t("admin.col.code")}
                </th>
                <th scope="col" className={cn(thClass, "text-right")}>
                  {t("admin.col.clicks")}
                </th>
                <th scope="col" className={thClass}>
                  {t("admin.col.signups")}
                </th>
                <th scope="col" className={thClass}>
                  {t("admin.col.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const count = r.signups?.length ?? 0;
                const purchased = (r.signups ?? []).filter((s) => s.has_purchased).length;
                const open = expanded.has(r.id);
                const panelId = `mv-referral-${r.id}`;
                const status = STATUSES.includes(r.reward_status) ? r.reward_status : "pending";
                const who = r.referrer_name || r.referrer_email;
                return (
                  <Fragment key={r.id}>
                    <tr className={rowClass} data-referral={r.id}>
                      <td className={tdClass}>
                        <span className="block font-medium">{who}</span>
                        {r.referrer_name && <span className="block text-xs text-mv-muted">{r.referrer_email}</span>}
                      </td>
                      <td className={cn(tdClass, "font-mono tracking-[0.08em]")}>{r.code}</td>
                      <td className={cn(tdClass, "text-right font-mono tabular-nums")}>{r.clicks ?? 0}</td>
                      <td className={cn(tdClass, "py-1.5")}>
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => toggleExpanded(r.id)}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-mv-line px-3.5 text-sm hover:border-mv-violet-400/60 hover:bg-mv-violet-500/10"
                        >
                          <span className="font-mono tabular-nums">{count}</span>
                          {purchased > 0 && (
                            <span className="text-xs text-mv-success">
                              · {purchased} {t("admin.purchasedMark")}
                            </span>
                          )}
                          <span className="sr-only">{t("admin.col.signups")}: {who}</span>
                          <ChevronDown aria-hidden="true" size={15} strokeWidth={1.75} className={cn("transition-transform duration-200", open && "rotate-180")} />
                        </button>
                      </td>
                      <td className={cn(tdClass, "py-1.5")}>
                        <label className="sr-only" htmlFor={`${panelId}-status`}>
                          {t("admin.col.status")}: {who}
                        </label>
                        <span className={cn("relative inline-flex rounded-full border", STATUS_STYLE[status])}>
                          <select
                            id={`${panelId}-status`}
                            value={status}
                            disabled={saving.has(r.id)}
                            onChange={(e) => save(r.id, { reward_status: e.target.value })}
                            className="min-h-[44px] cursor-pointer appearance-none rounded-full bg-transparent py-2 pl-4 pr-9 text-sm font-medium text-current"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s} className="bg-mv-surface text-mv-text">
                                {t(`referral.status.${s}`)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown aria-hidden="true" size={15} strokeWidth={1.75} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                        </span>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-t border-mv-line">
                        <td id={panelId} colSpan={5} className="px-4 pb-4 pt-2">
                          <Friends referral={r} busy={saving.has(r.id)} onToggle={(i, checked) => togglePurchased(r, i, checked)} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </TableScroll>
      )}
    </div>
  );
}
