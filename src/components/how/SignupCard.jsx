import { useRef } from "react";
import { Mail, Store } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { LogoMark } from "@/components/nav/Logo";
import BorderBeam from "@/components/fx/BorderBeam";
import { useArtLoop } from "@/components/how/useArtLoop";

const CARD_STYLE = {
  background: "linear-gradient(180deg, rgb(var(--mv-surface) / 0.94), rgb(var(--mv-surface) / 0.66))",
  border: "1px solid var(--mv-line)",
  boxShadow: "var(--mv-glass-highlight), 0 40px 90px -40px rgba(76, 29, 149, 0.75)",
};

const BUTTON_STYLE = {
  background: "linear-gradient(180deg, #8B5CF6, #6D28D9)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 0 1px rgba(139,92,246,0.5), 0 8px 32px -8px rgba(139,92,246,0.6)",
};

function Field({ icon: Icon, label, name }) {
  return (
    <div className="mt-5">
      <p className="text-[12.5px] font-medium text-mv-muted">{label}</p>
      <div className="relative mt-2 flex h-12 items-center gap-2.5 rounded-input border border-mv-line bg-mv-surface-2/80 px-3.5">
        <span
          data-focus={name}
          className="absolute -inset-px rounded-input border border-mv-violet-400/70 opacity-0 shadow-[0_0_0_4px_rgb(var(--mv-violet-500)/0.14)]"
        />
        <Icon size={18} strokeWidth={1.5} className="relative shrink-0 text-mv-muted" />
        <span className="relative flex min-w-0 items-center text-[15px] text-mv-text">
          <span data-type={name} className="truncate whitespace-pre" />
          <span data-caret={name} className="ml-px inline-block h-[18px] w-[2px] shrink-0 rounded-full bg-mv-violet-400 opacity-0" />
        </span>
      </div>
    </div>
  );
}

/**
 * Step 1 illustration: a glass sign-up card whose fields type themselves (Magic UI Typing Animation idea:
 * business name, then email), the button is pressed and a check draws. One 8s loop; the caret does not
 * blink (nothing loops faster than 6s). No backdrop blur: the card rides a track transformed every frame.
 */
export default function SignupCard({ active, still }) {
  const { t } = useI18n();
  const root = useRef(null);
  const name = t("phone.name");
  const email = [].concat(t("newsletter.placeholders"))[0] ?? "";

  const field = (key) => root.current.querySelector(`[data-type="${key}"]`);

  useArtLoop(root, {
    active,
    still,
    deps: [name, email],
    final: () => {
      field("name").textContent = name;
      field("email").textContent = email;
      gsap.set("[data-check] circle, [data-check] path", { drawSVG: "100%" });
    },
    build: (tl) => {
      const typeInto = (target, key, text, at, speed) => {
        const el = field(key);
        const proxy = { n: 0 };
        target.fromTo(
          proxy,
          { n: 0 },
          {
            n: text.length,
            duration: Math.max(0.2, text.length * speed),
            ease: "none",
            onUpdate: () => {
              el.textContent = text.slice(0, Math.round(proxy.n));
            },
          },
          at,
        );
        return at + Math.max(0.2, text.length * speed);
      };
      const clear = () => {
        field("name").textContent = "";
        field("email").textContent = "";
      };

      clear();
      gsap.set("[data-check]", { autoAlpha: 0 });
      gsap.set("[data-check] circle, [data-check] path", { drawSVG: "0%" });

      const loop = gsap.timeline({ repeat: -1 });
      loop
        .call(clear, null, 0)
        .set("[data-type]", { autoAlpha: 1 }, 0)
        .set("[data-check]", { autoAlpha: 0 }, 0)
        .set("[data-check] circle, [data-check] path", { drawSVG: "0%" }, 0)
        .to('[data-focus="name"], [data-caret="name"]', { autoAlpha: 1, duration: 0.3 }, 0.3);
      const nameDone = typeInto(loop, "name", name, 0.55, 0.075) + 0.25;
      loop
        .to('[data-focus="name"], [data-caret="name"]', { autoAlpha: 0, duration: 0.25 }, nameDone)
        .to('[data-focus="email"], [data-caret="email"]', { autoAlpha: 1, duration: 0.3 }, nameDone + 0.1);
      const emailDone = typeInto(loop, "email", email, nameDone + 0.3, 0.055) + 0.3;
      loop
        .to('[data-focus="email"], [data-caret="email"]', { autoAlpha: 0, duration: 0.25 }, emailDone)
        .to("[data-button]", { scale: 0.96, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 }, emailDone + 0.2)
        .fromTo("[data-check]", { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "mv.spring" }, emailDone + 0.45)
        .to("[data-check] circle", { drawSVG: "100%", duration: 0.6, ease: "mv.inOut" }, emailDone + 0.5)
        .to("[data-check] path", { drawSVG: "100%", duration: 0.4, ease: "mv.out" }, emailDone + 0.95);
      const end = Math.max(8, emailDone + 4);
      loop.to("[data-type], [data-check]", { autoAlpha: 0, duration: 0.4, ease: "none" }, end - 0.5).set({}, {}, end);
      tl.add(loop, 0);
    },
  });

  return (
    <div ref={root} className="relative h-full w-full">
      <div className="absolute inset-0" style={{ background: "radial-gradient(48% 52% at 50% 52%, rgb(var(--mv-violet-600) / 0.26), transparent 72%)" }} />
      <div className="absolute left-1/2 top-1/2 w-[392px] -translate-x-1/2 -translate-y-1/2 rounded-card p-7" style={CARD_STYLE}>
        {active && !still && <BorderBeam duration={8} size={150} />}
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-7 w-7" />
          <span className="font-display text-[1.1rem] font-bold tracking-[-0.03em] text-mv-text">Menuverse</span>
        </div>
        <Field icon={Store} label={t("how.demo.business")} name="name" />
        <Field icon={Mail} label={t("login.email")} name="email" />
        <div data-button className="mt-6 flex h-12 items-center justify-center rounded-full text-[15px] font-medium text-white" style={BUTTON_STYLE}>
          {t("how.1.title")}
        </div>
      </div>
      <svg data-check viewBox="0 0 64 64" className="absolute right-[60px] top-[30px] h-16 w-16 overflow-visible">
        <circle cx="32" cy="32" r="26" transform="rotate(-90 32 32)" style={{ fill: "rgb(var(--mv-surface))", stroke: "rgb(var(--mv-success))" }} strokeWidth="3" />
        <path d="M21 33.5l7.5 7.5L44 25" fill="none" style={{ stroke: "rgb(var(--mv-success))" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
