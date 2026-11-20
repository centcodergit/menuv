import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CircleAlert, CircleCheck, Loader2, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { useAuth } from "@/lib/AuthContext";
import { getBase44 } from "@/api/getBase44";
import { openChat } from "@/lib/chatBus";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsTouch } from "@/hooks/useIsTouch";
import { TransitionLink, usePageTransition } from "@/providers/PageTransition";
import AuthField from "@/components/login/AuthField";
import OtpField, { OTP_LENGTH } from "@/components/login/OtpField";
import { GoogleMark, MicrosoftMark } from "@/components/login/BrandIcons";
import { PROVIDER_FLAG, whenOnPage } from "@/components/login/redirect";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const statusOf = (err) => err?.status ?? err?.response?.status;
const MIN_PASSWORD = 8;

/** Where to go after signing in (3.4 / 3.5). Plan > chat > same-site path > home. */
function useFinishSignIn(params) {
  const { t } = useI18n();
  const { transitionTo } = usePageTransition();
  return useCallback(() => {
    const { plan, billing, currency, chat, path } = params;
    if (plan) {
      const message =
        plan === "enterprise"
          ? t("pricing.chatPrefillEnterprise")
          : t("pricing.chatPrefill", { plan: t(`pricing.plans.${plan}.name`), billing: t(`pricing.${billing}`), currency });
      transitionTo("/#pricing", { replace: true });
      whenOnPage("/", () => openChat({ message }));
      return;
    }
    if (chat) {
      transitionTo("/", { replace: true });
      whenOnPage("/", () => openChat());
      return;
    }
    transitionTo(path ?? "/", { replace: true });
  }, [params, t, transitionTo]);
}

/** "{terms} … {privacy}" with both placeholders turned into links. */
function LegalLine({ t }) {
  const parts = String(t("login.legal")).split(/(\{terms\}|\{privacy\})/);
  const link = "rounded text-mv-text underline decoration-mv-violet-400/50 underline-offset-2 hover:decoration-mv-violet-300";
  return (
    <p className="text-center text-xs leading-relaxed text-mv-muted">
      {parts.map((part, i) => {
        if (part === "{terms}")
          return (
            <TransitionLink key={i} to="/termsofservice" className={link}>
              {t("footer.terms")}
            </TransitionLink>
          );
        if (part === "{privacy}")
          return (
            <TransitionLink key={i} to="/privacypolicy" className={link}>
              {t("footer.privacy")}
            </TransitionLink>
          );
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function Spinner() {
  return <Loader2 size={18} strokeWidth={2} aria-hidden="true" className="shrink-0 animate-spin" />;
}

function SubmitButton({ busy, working, children }) {
  return (
    <button type="submit" disabled={busy} className="btn-primary w-full !min-h-[52px] text-base disabled:cursor-wait disabled:opacity-75">
      {working && <Spinner />}
      {children}
    </button>
  );
}

function LinkButton({ onClick, disabled, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-[44px] items-center rounded-md px-1 text-sm font-medium text-mv-violet-300 underline-offset-4 transition-colors hover:text-mv-violet-200 hover:underline disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

function FormAlert({ message }) {
  return (
    <div aria-live="polite" className="min-h-0">
      {message && (
        <p
          className="flex items-start gap-2 rounded-input border border-mv-danger/40 bg-mv-danger/10 px-4 py-3 text-sm font-medium text-mv-danger"
        >
          <CircleAlert size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * The /login card (master prompt 8.1, 3.4): sign in, register → 6-digit email code, forgot password, and an
 * "already signed in" state. Google / Microsoft go through the Base44 redirect and come back to /login with the
 * same query, where the redirect logic finishes the job. Modes cross-fade while the card eases to its new height
 * (instant under reduced motion).
 */
export default function AuthCard({ params, className }) {
  const { t } = useI18n();
  const { user, isAuthenticated, authChecked, checkUserAuth, logout } = useAuth();
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();
  const finish = useFinishSignIn(params);

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");
  const [working, setWorking] = useState(null); // "email" | "google" | "microsoft" | "resend" | "continue" | null
  const finishing = useRef(false);

  const root = useRef(null);
  const frame = useRef(null);
  const lastHeight = useRef(0);
  const shownMode = useRef(mode);
  const pendingFocus = useRef(null);
  const headingRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const codeRef = useRef(null);
  const shells = { email: useRef(null), password: useRef(null), code: useRef(null) };
  const inputs = { email: emailRef, password: passwordRef, code: codeRef };
  const busy = working !== null;

  const { contextSafe } = useGSAP({ scope: root });

  // Remember the card body's height so a mode change can ease from it.
  useEffect(() => {
    const el = frame.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => {
      lastHeight.current = el.offsetHeight;
    });
    ro.observe(el);
    lastHeight.current = el.offsetHeight;
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (shownMode.current === mode) return;
      shownMode.current = mode;
      const el = frame.current;
      const to = el.offsetHeight;
      const from = lastHeight.current || to;
      if (!reduced && Math.abs(from - to) > 1) {
        gsap.fromTo(el, { height: from, overflow: "hidden" }, { height: to, duration: 0.42, ease: "mv.out", clearProps: "height,overflow" });
      }
      if (!reduced) gsap.from("[data-mode]", { opacity: 0, y: 10, duration: 0.32, ease: "mv.out", delay: 0.06 });
      // Focus: the first field of a form, else the new heading (announced by screen readers). Fields are disabled
      // while a request runs, so focus waits until the card is idle again (effect below).
      pendingFocus.current = { signin: emailRef, register: emailRef, forgot: emailRef, otp: codeRef }[mode] ?? headingRef;
    },
    { dependencies: [mode], scope: root },
  );
  useEffect(() => {
    if (working !== null || !pendingFocus.current) return;
    pendingFocus.current.current?.focus({ preventScroll: true });
    pendingFocus.current = null;
  }, [mode, working]);

  const go = useCallback((next) => {
    setErrors({});
    setAttempted(false);
    setServerError("");
    setNotice("");
    if (next !== "otp") setCode("");
    setMode(next);
  }, []);

  // Already signed in on arrival → "signed in as …" with Continue (no auto-bounce), except right after a
  // Google / Microsoft round trip, which finishes on its own.
  useEffect(() => {
    if (!authChecked || !isAuthenticated || finishing.current) return;
    let fromProvider = false;
    try {
      fromProvider = sessionStorage.getItem(PROVIDER_FLAG) === "1";
      sessionStorage.removeItem(PROVIDER_FLAG);
    } catch {
      /* storage unavailable */
    }
    if (fromProvider) {
      finishing.current = true;
      setWorking("continue");
      finish();
      return;
    }
    go("signedIn");
  }, [authChecked, isAuthenticated, finish, go]);

  // Coming back from the provider page with the browser's Back button (bfcache) must not leave the card disabled.
  useEffect(() => {
    const onShow = (e) => {
      if (!e.persisted) return;
      finishing.current = false;
      setWorking(null);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const validate = useCallback(
    (which) => {
      const e = {};
      if (which !== "otp" && !EMAIL_RE.test(email.trim())) e.email = t("login.errorEmail");
      if (which === "signin" && !password) e.password = t("login.errorPassword");
      if (which === "register" && password.length < MIN_PASSWORD) e.password = t("login.errorPassword");
      if (which === "otp" && code.length !== OTP_LENGTH) e.code = t("login.errorOtp");
      return e;
    },
    [email, password, code, t],
  );

  // After the first submit, errors follow the input live.
  useEffect(() => {
    if (attempted) setErrors(validate(mode));
  }, [attempted, validate, mode]);

  const shake = contextSafe((el) => {
    if (!el || reduced) return;
    gsap.fromTo(el, { x: 0 }, { keyframes: { x: [-6, 6, -4, 4, 0] }, duration: 0.4, ease: "none", clearProps: "x" });
  });

  /** Validates; on errors shakes and focuses the first invalid field. */
  const check = (which) => {
    setAttempted(true);
    setServerError("");
    const e = validate(which);
    setErrors(e);
    const first = ["email", "password", "code"].find((k) => e[k]);
    if (!first) return true;
    shake(shells[first].current);
    inputs[first].current?.focus();
    return false;
  };

  const run = async (kind, fn) => {
    setWorking(kind);
    setServerError("");
    setNotice("");
    try {
      await fn();
    } finally {
      if (!finishing.current) setWorking(null);
    }
  };

  const signInAndFinish = async (b) => {
    await b.auth.loginViaEmailPassword(email.trim(), password);
    finishing.current = true;
    await checkUserAuth();
    finish();
  };

  const onSignIn = (e) => {
    e.preventDefault();
    if (busy || !check("signin")) return;
    run("email", async () => {
      try {
        await signInAndFinish(await getBase44());
      } catch (err) {
        finishing.current = false;
        const s = statusOf(err);
        setServerError([400, 401, 403, 404].includes(s) ? t("login.errorCredentials") : t("common.error"));
      }
    });
  };

  const onRegister = (e) => {
    e.preventDefault();
    if (busy || !check("register")) return;
    run("email", async () => {
      try {
        const b = await getBase44();
        await b.auth.register({ email: email.trim(), password });
        go("otp");
      } catch (err) {
        const s = statusOf(err);
        const exists = s === 409 || /already|exist/i.test(String(err?.message ?? err?.response?.data?.detail ?? ""));
        setServerError(exists ? t("login.errorExists") : t("common.error"));
      }
    });
  };

  const verify = (otpCode) =>
    run("email", async () => {
        const b = await getBase44();
        try {
          await b.auth.verifyOtp({ email: email.trim(), otpCode });
        } catch (err) {
          const s = statusOf(err);
          setErrors({ code: [400, 401, 403, 404, 410, 422].includes(s) ? t("login.errorOtp") : undefined });
          if (![400, 401, 403, 404, 410, 422].includes(s)) setServerError(t("common.error"));
          else shake(shells.code.current);
          return;
        }
        try {
          await signInAndFinish(b);
        } catch {
          finishing.current = false;
          setServerError(t("common.error"));
        }
    });

  const onVerify = (e) => {
    e.preventDefault();
    if (busy || !check("otp")) return;
    verify(code);
  };

  // Typing (or pasting / autofilling) the sixth digit submits.
  const onCode = (value) => {
    setCode(value);
    if (errors.code) setErrors({});
    if (value.length === OTP_LENGTH && value !== code && !busy) verify(value);
  };

  const onResend = () =>
    run("resend", async () => {
      try {
        const b = await getBase44();
        await b.auth.resendOtp(email.trim());
        setErrors({});
        setCode("");
        setNotice(t("login.otpResent"));
      } catch {
        setServerError(t("common.error"));
      }
    });

  const onForgot = (e) => {
    e.preventDefault();
    if (busy || !check("forgot")) return;
    run("email", async () => {
      try {
        const b = await getBase44();
        await b.auth.resetPasswordRequest(email.trim());
        go("forgotSent");
      } catch (err) {
        // Never reveal whether an account exists.
        if (statusOf(err) === 404) go("forgotSent");
        else setServerError(t("common.error"));
      }
    });
  };

  const onProvider = (provider) =>
    run(provider, async () => {
      try {
        sessionStorage.setItem(PROVIDER_FLAG, "1");
      } catch {
        /* storage unavailable: the return lands on the signed-in state instead */
      }
      try {
        const b = await getBase44();
        finishing.current = true; // the page is about to leave; keep the buttons disabled
        b.auth.loginWithProvider(provider, `${window.location.pathname}${window.location.search}`);
      } catch {
        finishing.current = false;
        try {
          sessionStorage.removeItem(PROVIDER_FLAG);
        } catch {
          /* ignore */
        }
        setServerError(t("common.error"));
      }
    });

  const onContinue = () => {
    finishing.current = true;
    setWorking("continue");
    finish();
  };

  const planLine = params.plan
    ? t("login.plan", { plan: t(`pricing.plans.${params.plan}.name`), billing: t(`pricing.${params.billing}`) })
    : null;

  const heading = (text) => (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.035em] text-mv-text outline-none sm:text-[2.25rem]"
    >
      {text}
    </h1>
  );
  const lead = (content) => <p className="mt-2 text-body-lg text-mv-muted">{content}</p>;

  const providers = (
    <>
      <div className="mt-6 grid grid-cols-1 gap-3">
        {[
          ["google", GoogleMark, t("login.google")],
          ["microsoft", MicrosoftMark, t("login.microsoft")],
        ].map(([id, Mark, label]) => (
          <button
            key={id}
            type="button"
            disabled={busy}
            onClick={() => onProvider(id)}
            className="btn-outline w-full !min-h-[50px] !py-2.5 bg-mv-surface/40 text-[0.95rem] disabled:cursor-wait disabled:opacity-60"
          >
            {working === id ? <Spinner /> : <Mark className="h-[18px] w-[18px] shrink-0" />}
            {label}
          </button>
        ))}
      </div>
      <div className="my-5 flex items-center gap-4 font-mono text-label uppercase text-mv-muted">
        <span aria-hidden="true" className="h-px flex-1 bg-mv-line-strong" />
        {t("login.or")}
        <span aria-hidden="true" className="h-px flex-1 bg-mv-line-strong" />
      </div>
    </>
  );

  const emailField = (
    <AuthField
      ref={emailRef}
      shellRef={shells.email}
      id="login-email"
      type="email"
      label={t("login.email")}
      autoComplete="email"
      inputMode="email"
      autoCapitalize="none"
      spellCheck={false}
      value={email}
      onChange={setEmail}
      error={errors.email}
      disabled={busy}
    />
  );

  const passwordField = (isNew) => (
    <AuthField
      ref={passwordRef}
      shellRef={shells.password}
      id="login-password"
      type="password"
      label={t("login.password")}
      autoComplete={isNew ? "new-password" : "current-password"}
      minLength={isNew ? MIN_PASSWORD : undefined}
      hint={isNew ? t("login.passwordHint") : undefined}
      showLabel={t("login.showPassword")}
      hideLabel={t("login.hidePassword")}
      value={password}
      onChange={setPassword}
      error={errors.password}
      disabled={busy}
    />
  );

  let body;
  if (mode === "signin") {
    body = (
      <>
        {heading(t("login.title"))}
        {lead(t("login.subtitle"))}
        {providers}
        <form noValidate onSubmit={onSignIn} aria-busy={busy} className="flex flex-col gap-4">
          {emailField}
          {passwordField(false)}
          <div className="-my-2 flex justify-end">
            <LinkButton onClick={() => go("forgot")} disabled={busy}>
              {t("login.forgot")}
            </LinkButton>
          </div>
          <FormAlert message={serverError} />
          <SubmitButton busy={busy} working={working === "email"}>
            {t("login.submit")}
          </SubmitButton>
        </form>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-mv-muted">
          {t("login.noAccountPrompt")}
          <LinkButton onClick={() => go("register")} disabled={busy}>
            {t("login.registerLink")}
          </LinkButton>
        </p>
      </>
    );
  } else if (mode === "register") {
    body = (
      <>
        {heading(t("login.registerTitle"))}
        {lead(t("login.registerSubtitle"))}
        {providers}
        <form noValidate onSubmit={onRegister} aria-busy={busy} className="flex flex-col gap-4">
          {emailField}
          {passwordField(true)}
          <FormAlert message={serverError} />
          <SubmitButton busy={busy} working={working === "email"}>
            {t("login.registerSubmit")}
          </SubmitButton>
        </form>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-mv-muted">
          {t("login.haveAccountPrompt")}
          <LinkButton onClick={() => go("signin")} disabled={busy}>
            {t("login.signInLink")}
          </LinkButton>
        </p>
      </>
    );
  } else if (mode === "otp") {
    const [before, after = ""] = String(t("login.otpBody")).split("{email}");
    body = (
      <>
        {heading(t("login.otpTitle"))}
        {lead(
          <>
            {before}
            <strong className="font-semibold text-mv-text [overflow-wrap:anywhere]">{email.trim()}</strong>
            {after}
          </>,
        )}
        <form noValidate onSubmit={onVerify} aria-busy={busy} className="mt-8 flex flex-col gap-5">
          <OtpField ref={codeRef} shellRef={shells.code} id="login-otp" label={t("login.otpLabel")} value={code} onChange={onCode} error={errors.code} disabled={busy} />
          <div aria-live="polite" className="min-h-0">
            {notice && (
              <p className="flex items-center gap-2 text-sm font-medium text-mv-success">
                <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
                {notice}
              </p>
            )}
          </div>
          <FormAlert message={serverError} />
          <SubmitButton busy={busy} working={working === "email"}>
            {t("login.otpSubmit")}
          </SubmitButton>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4">
          <LinkButton onClick={onResend} disabled={busy}>
            {working === "resend" && <Spinner />}
            <span className={cn(working === "resend" && "ml-2")}>{t("login.otpResend")}</span>
          </LinkButton>
          <LinkButton onClick={() => go("signin")} disabled={busy} className="text-mv-muted hover:text-mv-text">
            {t("login.backToSignIn")}
          </LinkButton>
        </div>
      </>
    );
  } else if (mode === "forgot") {
    body = (
      <>
        {heading(t("login.forgotTitle"))}
        {lead(t("login.forgotBody"))}
        <form noValidate onSubmit={onForgot} aria-busy={busy} className="mt-8 flex flex-col gap-4">
          {emailField}
          <FormAlert message={serverError} />
          <SubmitButton busy={busy} working={working === "email"}>
            {t("login.forgotSubmit")}
          </SubmitButton>
        </form>
        <div className="mt-4 flex justify-center">
          <LinkButton onClick={() => go("signin")} disabled={busy} className="text-mv-muted hover:text-mv-text">
            {t("login.backToSignIn")}
          </LinkButton>
        </div>
      </>
    );
  } else if (mode === "forgotSent") {
    body = (
      <>
        <span aria-hidden="true" className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-mv-violet-400/40 bg-mv-violet-500/10 text-mv-violet-300">
          <CircleCheck size={26} strokeWidth={1.75} />
        </span>
        {heading(t("login.forgotTitle"))}
        <p role="status" className="mt-3 text-body-lg text-mv-muted">
          {t("login.forgotSent")}
        </p>
        <button type="button" onClick={() => go("signin")} className="btn-outline mt-8 w-full !min-h-[52px]">
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          {t("login.backToSignIn")}
        </button>
      </>
    );
  } else {
    // signedIn
    body = (
      <>
        <span aria-hidden="true" className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-mv-violet-400/40 bg-mv-violet-500/10 text-mv-violet-300">
          <CircleCheck size={26} strokeWidth={1.75} />
        </span>
        {heading(t("login.title"))}
        <p className="mt-3 break-words text-body-lg text-mv-muted">{t("login.signedIn", { email: user?.email ?? "" })}</p>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" onClick={onContinue} disabled={busy} className="btn-primary w-full !min-h-[52px] text-base disabled:cursor-wait disabled:opacity-75">
            {working === "continue" && <Spinner />}
            {t("login.continue")}
          </button>
          <button type="button" onClick={() => logout(true)} disabled={busy} className="btn-outline w-full !min-h-[52px] disabled:opacity-60">
            {t("nav.logout")}
          </button>
        </div>
      </>
    );
  }

  return (
    <div
      ref={root}
      className={cn(
        "relative overflow-hidden rounded-card p-5 shadow-[0_40px_100px_-50px_rgb(var(--mv-violet-600)/0.55)] sm:px-9 sm:py-7",
        isTouch ? "stone" : "glass",
        className,
      )}
    >
      {/* Violet hairline glow along the top edge (the obsidian card's catch-light). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-mv-violet-400/70 to-transparent"
      />
      <span role="status" className="sr-only">
        {busy ? t("login.working") : ""}
      </span>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TransitionLink
          to="/"
          className="-ml-1 inline-flex min-h-[44px] items-center gap-2 rounded-md px-1 font-mono text-label uppercase text-mv-muted transition-colors hover:text-mv-text"
        >
          <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
          {t("login.back")}
        </TransitionLink>
      </div>

      {planLine && (
        <p
          data-plan-line
          className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-mv-violet-400/40 bg-mv-violet-500/10 px-4 py-2 text-sm font-medium text-mv-violet-200"
        >
          <Sparkles size={15} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <span className="min-w-0">{planLine}</span>
        </p>
      )}

      <div ref={frame} className="mt-3">
        <div key={mode} data-mode={mode}>
          {body}
        </div>
      </div>

      <div className="mt-6 border-t border-mv-line pt-4">
        <LegalLine t={t} />
      </div>
    </div>
  );
}
