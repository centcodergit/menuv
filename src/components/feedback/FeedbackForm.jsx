import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { getBase44, hasBackend } from "@/api/getBase44";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollTo } from "@/hooks/useSmoothScroll";
import { NAV_OFFSET } from "@/providers/SmoothScroll";
import Magnet from "@/components/fx/Magnet";
import StatefulButton from "@/components/fx/StatefulButton";
import FloatingField from "@/components/feedback/FloatingField";
import StarRating from "@/components/feedback/StarRating";
import SegmentedChoice from "@/components/feedback/SegmentedChoice";
import ThankYou from "@/components/feedback/ThankYou";
import { preloadConfetti } from "@/components/referral/confetti";

export const SENT_KEY = "mv-feedback-sent";
const ORDER = ["name", "rating", "purchased", "change", "feature"];
const LIMITS = { name: 120, change: 4000, feature: 4000 }; // base44/entities/Feedback.jsonc
const EMPTY = { name: "", rating: 0, purchased: null, change: "", feature: "" };
const MIN_LOADING = 700; // ms: the spinner always reads as a step, even when the save is instant
const EASE = [0.16, 1, 0.3, 1];

const wait = (ms) => new Promise((r) => window.setTimeout(r, ms));
const isValid = (key, v) => (key === "rating" ? v[key] >= 1 && v[key] <= 5 : key === "purchased" ? typeof v[key] === "boolean" : v[key].trim().length > 0);
const validate = (v) => Object.fromEntries(ORDER.filter((k) => !isValid(k, v)).map((k) => [k, "required"]));

const readSent = () => {
  try {
    return sessionStorage.getItem(SENT_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * 7.12 / 3.7 feedback form. All five fields are required. Validation runs on submit and, after a first submit,
 * on blur (errors also clear as soon as a field is fixed); invalid fields shake 6px and focus moves to the first.
 * A hidden honeypot that a bot fills makes the form pretend success without saving. One submission per session
 * (sessionStorage "mv-feedback-sent"): a revisit shows the thank-you state directly.
 */
export default function FeedbackForm() {
  const { t, lang } = useI18n();
  const reduced = useReducedMotion();
  const scrollTo = useScrollTo();
  const root = useRef(null);
  const controls = useRef({});
  const shells = useRef({});
  const alive = useRef(true);
  const preloaded = useRef(false);

  const [values, setValues] = useState(EMPTY);
  const [honey, setHoney] = useState("");
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(() => (readSent() ? "session" : null)); // null | "session" | "fresh"

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const { contextSafe } = useGSAP({ scope: root });
  const shake = contextSafe((keys) => {
    if (reduced) return;
    const els = keys.map((k) => shells.current[k]).filter(Boolean);
    gsap.fromTo(els, { x: 0 }, { keyframes: { x: [-6, 6, -5, 5, -3, 3, 0] }, duration: 0.45, ease: "none", overwrite: true, clearProps: "transform" });
  });

  const focusField = (key) => {
    const control = controls.current[key];
    const shell = shells.current[key];
    if (!control) return;
    control.focus({ preventScroll: true });
    const r = shell?.getBoundingClientRect();
    if (r && (r.top < NAV_OFFSET || r.bottom > window.innerHeight - 24)) scrollTo(shell, { offset: -NAV_OFFSET - 32 });
  };

  const set = (key) => (value) => {
    const next = { ...values, [key]: value };
    setValues(next);
    setFailed(false);
    // After a first submit: choices validate on change; text fields only clear their error here (they re-check on blur).
    if (attempted && (errors[key] || key === "rating" || key === "purchased")) {
      setErrors((e) => {
        const copy = { ...e };
        if (isValid(key, next)) delete copy[key];
        else copy[key] = "required";
        return copy;
      });
    }
  };

  const blur = (key) => () => {
    if (!attempted) return;
    setErrors((e) => {
      const copy = { ...e };
      if (isValid(key, values)) delete copy[key];
      else copy[key] = "required";
      return copy;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (status !== "idle") return;
    setAttempted(true);
    setFailed(false);
    const found = validate(values);
    setErrors(found);
    const invalid = ORDER.filter((k) => found[k]);
    if (invalid.length) {
      shake(invalid);
      focusField(invalid[0]);
      return;
    }

    setStatus("loading");
    const started = performance.now();
    try {
      // Honeypot filled: a bot. Pretend everything went fine and save nothing.
      if (!honey) {
        if (!hasBackend) throw new Error("No backend configured");
        const base44 = await getBase44();
        await base44.entities.Feedback.create({
          name: values.name.trim().slice(0, LIMITS.name),
          rating: values.rating,
          purchased_menu: values.purchased,
          change_request: values.change.trim().slice(0, LIMITS.change),
          feature_request: values.feature.trim().slice(0, LIMITS.feature),
          language: lang,
        });
      }
      await wait(Math.max(0, MIN_LOADING - (performance.now() - started)));
      if (!alive.current) return;
      try {
        sessionStorage.setItem(SENT_KEY, "1");
      } catch {
        /* storage unavailable: the thank-you state still shows for this visit */
      }
      setStatus("success");
      await wait(reduced ? 250 : 850);
      if (alive.current) setDone("fresh");
    } catch (err) {
      if (import.meta.env.DEV) console.info("[feedback] submit failed:", err?.message ?? err);
      await wait(Math.max(0, 400 - (performance.now() - started)));
      if (!alive.current) return;
      setStatus("idle");
      setFailed(true);
    }
  };

  const warmConfetti = () => {
    if (preloaded.current || reduced) return;
    preloaded.current = true;
    preloadConfetti();
  };

  const err = (key) => (errors[key] ? t(`feedback.${errors[key]}`) : undefined);
  const fold = reduced ? { duration: 0.2 } : { duration: 0.6, ease: EASE };

  return (
    <div ref={root}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="thanks"
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            transition={fold}
            className="overflow-hidden"
          >
            <ThankYou celebrate={done === "fresh"} focusOnMount={done === "fresh"} />
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={submit}
            onFocusCapture={warmConfetti}
            aria-busy={status === "loading" || undefined}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={fold}
            className={cn("grid grid-cols-1 gap-x-5 gap-y-7 md:grid-cols-2", status === "success" && "overflow-hidden")}
          >
            <div ref={(el) => (shells.current.name = el)} className="md:col-span-2">
              <FloatingField
                ref={(el) => (controls.current.name = el)}
                id="mv-feedback-name"
                label={t("feedback.name")}
                value={values.name}
                onChange={set("name")}
                onBlur={blur("name")}
                maxLength={LIMITS.name}
                autoComplete="name"
                enterKeyHint="next"
                error={err("name")}
              />
            </div>
            <div ref={(el) => (shells.current.rating = el)} className="min-w-0">
              <StarRating
                ref={(el) => (controls.current.rating = el)}
                id="mv-feedback-rating"
                label={t("feedback.rating")}
                starLabel={(n) => t("feedback.star", { n })}
                value={values.rating}
                onChange={set("rating")}
                error={err("rating")}
              />
            </div>
            <div ref={(el) => (shells.current.purchased = el)} className="min-w-0">
              <SegmentedChoice
                ref={(el) => (controls.current.purchased = el)}
                id="mv-feedback-purchased"
                label={t("feedback.purchased")}
                options={[
                  { value: true, label: t("feedback.yes") },
                  { value: false, label: t("feedback.no") },
                ]}
                value={values.purchased}
                onChange={set("purchased")}
                error={err("purchased")}
              />
            </div>
            <div ref={(el) => (shells.current.change = el)} className="md:col-span-2">
              <FloatingField
                ref={(el) => (controls.current.change = el)}
                id="mv-feedback-change"
                label={t("feedback.change")}
                value={values.change}
                onChange={set("change")}
                onBlur={blur("change")}
                multiline
                maxLength={LIMITS.change}
                error={err("change")}
              />
            </div>
            <div ref={(el) => (shells.current.feature = el)} className="md:col-span-2">
              <FloatingField
                ref={(el) => (controls.current.feature = el)}
                id="mv-feedback-feature"
                label={t("feedback.feature")}
                value={values.feature}
                onChange={set("feature")}
                onBlur={blur("feature")}
                multiline
                maxLength={LIMITS.feature}
                error={err("feature")}
              />
            </div>

            {/* Honeypot: off-screen and out of the tab order for people, tempting to bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
              <label htmlFor="mv-feedback-website">Website</label>
              <input id="mv-feedback-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
            </div>

            <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-end">
              <div className="min-h-0 md:mr-auto">
                {failed && (
                  <p role="alert" className="flex items-start gap-2 text-sm font-medium text-mv-danger">
                    <CircleAlert size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
                    {t("feedback.error")}
                  </p>
                )}
              </div>
              <Magnet strength={0.18} padding={40} className="w-full md:w-auto" innerClassName="w-full md:w-auto">
                <StatefulButton type="submit" state={status} loadingLabel={t("feedback.sending")} className="min-h-[52px] w-full px-8 md:w-auto">
                  {t("feedback.submit")}
                </StatefulButton>
              </Magnet>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
