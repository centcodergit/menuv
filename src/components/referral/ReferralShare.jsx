import { useEffect, useRef, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { shareTargets } from "@/api/referrals";
import { useIsTouch } from "@/hooks/useIsTouch";

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z" />
    </svg>
  );
}

function MessengerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.4 2 2 6.1 2 11.7c0 2.9 1.2 5.5 3.2 7.2V22l3-1.6c.9.2 1.8.4 2.8.4 5.6 0 10-4.1 10-9.7S17.6 2 12 2Zm1 12.9-2.5-2.7-5 2.7 5.5-5.8 2.6 2.7 4.9-2.7-5.5 5.8Z" />
    </svg>
  );
}

/**
 * The referral link with copy (icon morphs to a check) and share buttons: WhatsApp everywhere, Messenger on
 * touch devices (its web share needs a Facebook app id), and the native share sheet where the browser has one.
 * Used by the section's "Ξεκινήστε" dialog and the /referrals dashboard.
 */
export default function ReferralShare({ link, className, size = "md" }) {
  const t = useT();
  const isTouch = useIsTouch();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  const field = useRef(null);
  const targets = shareTargets(link, t("referral.shareText", { link }));

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      field.current?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const iconBtn =
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-mv-line-strong text-mv-text transition-colors hover:bg-mv-violet-500/15 focus-visible:outline-offset-2";

  return (
    <div className={cn("space-y-3", className)}>
      <label htmlFor="mv-referral-link" className="font-mono text-label uppercase text-mv-muted">
        {t("referral.linkLabel")}
      </label>
      <div className={cn("flex items-center gap-2 rounded-full border border-mv-line-strong bg-mv-surface-2/80 p-1.5 pl-4", size === "lg" && "p-2 pl-5")}>
        <input
          id="mv-referral-link"
          ref={field}
          readOnly
          value={link}
          onFocus={(e) => e.target.select()}
          className={cn("min-w-0 flex-1 bg-transparent font-mono text-mv-text outline-none", size === "lg" ? "text-base" : "text-sm")}
        />
        <button type="button" onClick={copy} className="btn-primary relative !min-h-[40px] shrink-0 !px-4 !text-sm">
          <span className="relative inline-flex h-4 w-4">
            <Copy size={16} strokeWidth={1.75} className={cn("absolute inset-0 transition-all duration-300 ease-mv-spring", copied ? "scale-50 opacity-0" : "scale-100 opacity-100")} />
            <Check size={16} strokeWidth={2.25} className={cn("absolute inset-0 transition-all duration-300 ease-mv-spring", copied ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
          </span>
          <span>{copied ? t("referral.copied") : t("referral.copy")}</span>
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? t("referral.copied") : ""}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-label uppercase text-mv-muted">{t("referral.share")}</span>
        <a href={targets.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={`${t("referral.share")}: WhatsApp`} className={iconBtn}>
          <WhatsAppIcon />
        </a>
        {isTouch && (
          <a href={targets.messenger} aria-label={`${t("referral.share")}: Messenger`} className={iconBtn}>
            <MessengerIcon />
          </a>
        )}
        {targets.native && (
          <button
            type="button"
            aria-label={t("referral.share")}
            className={iconBtn}
            onClick={() => navigator.share(targets.native).catch(() => {})}
          >
            <Share2 size={18} strokeWidth={1.75} />
          </button>
        )}
      </div>
    </div>
  );
}
