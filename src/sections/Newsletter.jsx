import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { gsap } from "@/lib/gsap";
import { isValidEmail, subscribeNewsletter } from "@/api/newsletter";
import { useIsDesktop, useIsTouch } from "@/hooks/useIsTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import VanishInput from "@/components/fx/VanishInput";
import DotGrid from "@/components/fx/DotGrid";

/**
 * 7.14 Newsletter, "Εγγραφείτε στο Newsletter μας" (logic 3.8): Placeholders-and-Vanish email field over a
 * low-contrast Dot Grid that ripples from the cursor (desktop). Sign-up goes through the `subscribeNewsletter`
 * backend function (one row per email); a repeat address gets a friendly "already subscribed".
 */
export default function Newsletter() {
  const { t, lang } = useI18n();
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const isTouch = useIsTouch();
  const field = useRef(null);
  const shell = useRef(null);
  const [email, setEmail] = useState("");
  const [honey, setHoney] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });
  const placeholders = t("newsletter.placeholders");

  const shake = () => {
    if (reduced || !shell.current) return;
    gsap.fromTo(shell.current, { x: 0 }, { keyframes: { x: [-6, 6, -4, 4, 0] }, duration: 0.4, ease: "power1.inOut" });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (state.status === "sending") return;
    const value = email.trim();
    if (!isValidEmail(value)) {
      setState({ status: "invalid", message: t("newsletter.invalid") });
      shake();
      field.current?.focus();
      return;
    }
    setState({ status: "sending", message: "" });
    // Bots fill the hidden field: pretend it worked, save nothing.
    const request = honey ? Promise.resolve("subscribed") : subscribeNewsletter(value, lang);
    const vanish = field.current?.vanish() ?? Promise.resolve();
    try {
      const [result] = await Promise.all([request, vanish]);
      setEmail("");
      setState({ status: result, message: t(result === "duplicate" ? "newsletter.duplicate" : "newsletter.success") });
    } catch {
      await vanish.catch(() => {});
      setState({ status: "error", message: t("common.error") });
    }
  };

  const invalid = state.status === "invalid";
  const done = state.status === "subscribed" || state.status === "duplicate";

  return (
    <Section id="newsletter" bg="base" aria-labelledby="newsletter-title" className="overflow-hidden">
      {isDesktop && !isTouch ? (
        <DotGrid className="absolute inset-0 [mask-image:linear-gradient(transparent,black_18%,black_82%,transparent)]" still={reduced} />
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(transparent,black_18%,black_82%,transparent)]"
          style={{ backgroundImage: "radial-gradient(rgb(var(--mv-violet-400) / 0.18) 1.2px, transparent 1.4px)", backgroundSize: "26px 26px" }}
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(transparent,black_18%,black_82%,transparent)]"
        style={{ background: "radial-gradient(60% 55% at 50% 50%, transparent 30%, rgb(var(--mv-void) / 0.85) 100%)" }}
      />
      <div className="container-mv relative">
        <SectionHeader
          id="newsletter"
          eyebrow={t("newsletter.eyebrow")}
          title={t("newsletter.title")}
          lead={t("newsletter.lead")}
          accentWords={1}
          titleId="newsletter-title"
        />
        <form onSubmit={submit} noValidate className="mx-auto mt-12 max-w-xl md:mt-14">
          <div ref={shell}>
            <VanishInput
              ref={field}
              id="mv-newsletter-email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                if (state.status === "invalid" || state.status === "error" || done) setState({ status: "idle", message: "" });
              }}
              placeholders={Array.isArray(placeholders) ? placeholders : []}
              label={t("newsletter.emailLabel")}
              submitLabel={t("newsletter.submit")}
              disabled={state.status === "sending"}
              invalid={invalid}
              describedBy="mv-newsletter-status mv-newsletter-privacy"
            />
          </div>
          {/* Honeypot: invisible to people, tempting to bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
            <label htmlFor="mv-newsletter-company">Company</label>
            <input id="mv-newsletter-company" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
          </div>
          <div id="mv-newsletter-status" role="status" aria-live="polite" className="mt-4 min-h-[1.75rem] text-center">
            <AnimatePresence mode="wait">
              {state.message && (
                <motion.p
                  key={state.status}
                  initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className={
                    state.status === "subscribed"
                      ? "inline-flex items-center gap-2 font-medium text-mv-success"
                      : state.status === "duplicate"
                        ? "inline-flex items-center gap-2 font-medium text-mv-violet-300"
                        : "inline-flex items-center gap-2 font-medium text-mv-danger"
                  }
                >
                  {state.status === "subscribed" && <Check size={18} strokeWidth={2.25} aria-hidden="true" />}
                  {state.status === "duplicate" && <Info size={18} strokeWidth={2} aria-hidden="true" />}
                  {state.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <p id="mv-newsletter-privacy" className="mt-2 text-center text-sm text-mv-muted">
            {t("newsletter.privacy")}
          </p>
        </form>
      </div>
    </Section>
  );
}
