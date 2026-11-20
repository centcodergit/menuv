import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/providers/PageTransition";
import { usePageBackground } from "@/hooks/useBackgroundIntensity";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollTo } from "@/hooks/useSmoothScroll";
import LegalBlocks from "@/components/legal/LegalBlocks";

/**
 * Which section is being read: the last one whose top has passed 30% of the viewport.
 * Computed from positions on scroll (rAF-throttled), so it is exact even right after a smooth jump.
 */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);
  return active;
}

function Toc({ sections, active, onJump, label }) {
  return (
    <nav aria-label={label}>
      <p className="mb-4 font-mono text-label uppercase text-mv-muted">{label}</p>
      <ol className="space-y-1 border-l border-mv-line">
        {sections.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onJump(s.id);
                }}
                aria-current={on ? "location" : undefined}
                className={cn(
                  "relative -ml-px flex gap-3 border-l py-1.5 pl-4 text-sm leading-snug transition-colors duration-300",
                  on ? "border-mv-violet-400 text-mv-text" : "border-transparent text-mv-muted hover:text-mv-text",
                )}
              >
                <span className={cn("font-mono text-xs tabular-nums", on ? "text-mv-violet-300" : "text-mv-muted/70")}>
                  {String(s.number).padStart(2, "0")}
                </span>
                <span>{s.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Reading layout for the legal pages (master prompt 8.2): back link, title, last updated, numbered sections,
 * a sticky table of contents on desktop (active section highlighted), a collapsible one on mobile.
 * `doc` is { [lang]: { title, lastUpdated (ISO), sections } }. Missing languages fall back to English, and the
 * document is marked lang="en" with a short note, while the page chrome speaks the visitor's language.
 */
export default function LegalPage({ doc }) {
  const { t, lang, locale } = useI18n();
  const { pathname } = useLocation();
  const scrollTo = useScrollTo();
  const reduced = useReducedMotion();
  const root = useRef(null);
  usePageBackground("dim");

  const docLang = doc[lang] ? lang : "en";
  const content = doc[docLang];
  const ids = useMemo(() => content.sections.map((s) => s.id), [content]);
  const active = useActiveSection(ids);

  // English keeps the original "December 18, 2024" form; other languages get their own date style.
  const date = new Intl.DateTimeFormat(lang === "en" ? "en-US" : locale, { dateStyle: "long" }).format(
    new Date(`${content.lastUpdated}T12:00:00Z`),
  );

  useEffect(() => {
    const previous = document.title;
    document.title = `${content.title} | Menuverse`;
    return () => {
      document.title = previous;
    };
  }, [content.title]);

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from("[data-legal-rise]", { y: 24, autoAlpha: 0, stagger: 0.07, duration: 0.9, delay: 0.15 });
    },
    { scope: root, dependencies: [reduced] },
  );

  const jump = (id) => {
    scrollTo(`#${id}`);
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div ref={root} className="container-mv pb-section pt-32 md:pt-40">
      <header className="mb-12 max-w-reading lg:mb-16 lg:ml-[calc(25%+2rem)]">
        <TransitionLink
          to="/"
          data-legal-rise
          className="mb-10 inline-flex min-h-[44px] items-center gap-2 text-sm text-mv-muted transition-colors hover:text-mv-text"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          {t("legal.back")}
        </TransitionLink>
        <h1 data-legal-rise lang={docLang} className="font-display text-h2 font-bold">
          {content.title}
        </h1>
        <p data-legal-rise className="mt-4 font-mono text-label uppercase text-mv-muted">
          {t("legal.lastUpdated", { date })}
        </p>
        {docLang !== lang && (
          <p data-legal-rise className="mt-6 inline-flex rounded-inner border border-mv-line px-4 py-2 text-sm text-mv-muted">
            {t("legal.englishOnly")}
          </p>
        )}
      </header>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-28" data-lenis-prevent>
            <Toc sections={content.sections} active={active} onJump={jump} label={t("legal.contents")} />
          </div>
        </aside>

        <details className="stone group mb-10 rounded-inner p-5 lg:hidden">
          <summary className="flex min-h-[44px] list-none items-center justify-between font-mono text-label uppercase text-mv-muted [&::-webkit-details-marker]:hidden">
            {t("legal.contents")}
            <ChevronDown size={18} strokeWidth={1.5} className="transition-transform duration-300 ease-mv-out group-open:rotate-180" />
          </summary>
          <div className="pt-3">
            <Toc sections={content.sections} active={active} onJump={jump} label={t("legal.contents")} />
          </div>
        </details>

        <article lang={docLang} className="max-w-reading text-[17px] leading-[1.75] text-mv-muted lg:col-span-3">
          {content.sections.map((section) => (
            <section key={section.id} id={section.id} className="border-t border-mv-line py-10 first:border-t-0 first:pt-0">
              <h2 className="mb-5 flex items-baseline gap-4 font-display text-h3 font-semibold text-mv-text">
                <span className="font-mono text-sm font-medium tabular-nums text-mv-violet-300">
                  {String(section.number).padStart(2, "0")}
                </span>
                {section.title}
              </h2>
              <div className="space-y-4">
                <LegalBlocks blocks={section.blocks} currentPath={pathname} />
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
