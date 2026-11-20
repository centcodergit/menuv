import { useEffect, useState } from "react";
import { useNoIndex } from "@/hooks/useNoIndex";
import { ArrowLeft } from "lucide-react";
import { useI18n, loadDictionary } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/languages";
import { TransitionLink } from "@/providers/PageTransition";
import BrokenQR from "@/components/fx/BrokenQR";

/**
 * 404 (master prompt 8.5): big outlined "404" in Commissioner, a QR that fails to assemble, the line in the
 * visitor's language (H1) and, as a quiet multilingual touch, in all eight languages on a slow marquee.
 * Tells crawlers it is a real 404 (Base44 prerender convention).
 */
export default function PageNotFound() {
  useNoIndex();
  const { t, lang } = useI18n();
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "prerender-status-code";
    meta.content = "404";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let live = true;
    Promise.all(LANGUAGES.map((l) => loadDictionary(l.code).then((d) => ({ code: l.code, text: d.notFound?.title })))).then(
      (all) => live && setLines(all.filter((l) => l.text)),
    );
    return () => {
      live = false;
    };
  }, []);

  const row = lines.map((l) => (
    <span key={l.code} lang={l.code} className="flex items-center gap-6">
      {l.text}
      <span className="text-mv-violet-400">✦</span>
    </span>
  ));

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-16 pt-32">
      <div className="container-mv grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {/* Outline traced from the filled glyphs (erode + cut out), so the variable font's overlapping
              contours never show as stray lines the way a plain stroke would. */}
          <svg aria-hidden="true" viewBox="0 0 600 230" className="h-auto w-[min(100%,620px)] overflow-visible">
            <defs>
              <filter id="mv-404-outline" x="-5%" y="-5%" width="110%" height="110%">
                <feMorphology in="SourceAlpha" operator="erode" radius="1.6" result="inner" />
                <feComposite in="SourceGraphic" in2="inner" operator="out" />
              </filter>
            </defs>
            <text
              x="0"
              y="205"
              fontSize="270"
              fontWeight="800"
              letterSpacing="-12"
              fontFamily='"Commissioner Variable", system-ui, sans-serif'
              fill="rgb(var(--mv-violet-400))"
              opacity="0.65"
              filter="url(#mv-404-outline)"
            >
              404
            </text>
          </svg>
          <h1 className="mt-8 max-w-[18ch] font-display text-h2 font-bold">{t("notFound.title")}</h1>
          <TransitionLink to="/" className="btn-primary mt-10">
            <ArrowLeft size={18} strokeWidth={1.5} />
            {t("notFound.cta")}
          </TransitionLink>
        </div>
        <div className="mx-auto w-[min(70vw,360px)] lg:col-span-5">
          <BrokenQR className="h-auto w-full" />
        </div>
      </div>

      {lines.length > 0 && (
        <div aria-hidden="true" className="relative mt-20 flex overflow-hidden border-y border-mv-line py-4 [--gap:1.5rem]" data-lang-current={lang}>
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center gap-6 whitespace-nowrap pr-6 font-mono text-label uppercase text-mv-muted motion-safe:animate-marquee"
              style={{ "--duration": "60s" }}
            >
              {row}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
