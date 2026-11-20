import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { loadArticles, articleHash, slugFromHash } from "@/content/articles";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsDesktop } from "@/hooks/useIsTouch";
import { useScrollTo } from "@/hooks/useSmoothScroll";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import Magnet from "@/components/fx/Magnet";
import ShineBorder from "@/components/fx/ShineBorder";
import { MorphingDialogProvider } from "@/components/fx/MorphingDialog";
import ArticleCard from "@/components/articles/ArticleCard";
import ArticleRail from "@/components/articles/ArticleRail";
import ArticleReader from "@/components/articles/ArticleReader";

const urlWithoutHash = () => `${window.location.pathname}${window.location.search}`;
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/**
 * 7.13 Articles (logic 3.9): header, six guides, CTA strip. Desktop (fine pointer, >= 1024px): a draggable rail;
 * everything else: cards stack. A card morphs into the reader (Morphing Dialog).
 *
 * The section owns "#article-{slug}" hashes (Home's hash scroll ignores them):
 * - opening from a card pushes the hash (so Back closes the reader); prev / next replace it;
 * - closing goes back to the pre-reader entry, or (after a deep link) strips the hash, without a jump;
 * - loading /#article-{slug}, Back / Forward and typed hashes open or close the reader.
 */
export default function Articles() {
  const { t, lang } = useI18n();
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const scrollTo = useScrollTo();
  const morph = !reduced;

  const [articles, setArticles] = useState(null);
  const [openSlug, setOpenSlug] = useState(null);
  const [morphSlug, setMorphSlug] = useState(null);
  const [morphContent, setMorphContent] = useState(true);

  const rootRef = useRef(null);
  const railRef = useRef(null);
  const pushedRef = useRef(false);
  const openRef = useRef(null);
  const morphRef = useRef(null);
  const ctaPendingRef = useRef(false);
  openRef.current = openSlug;
  morphRef.current = morphSlug;

  // Texts for the active language (one small chunk per language); keep the previous ones while switching.
  useEffect(() => {
    let live = true;
    loadArticles(lang).then((list) => live && setArticles(list));
    return () => {
      live = false;
    };
  }, [lang]);

  const items = useMemo(() => articles?.map((a, index) => ({ ...a, index, total: articles.length })) ?? [], [articles]);

  const show = useCallback((slug, { push }) => {
    if (push) {
      window.history.pushState(window.history.state, "", `${urlWithoutHash()}${articleHash(slug)}`);
      pushedRef.current = true;
    } else {
      pushedRef.current = false;
    }
    setMorphSlug(slug);
    setMorphContent(true);
    setOpenSlug(slug);
  }, []);

  const close = useCallback(({ fromHistory = false } = {}) => {
    setOpenSlug(null);
    if (!fromHistory && slugFromHash(window.location.hash)) {
      if (pushedRef.current) window.history.back();
      else window.history.replaceState(window.history.state, "", urlWithoutHash());
    }
    pushedRef.current = false;
  }, []);

  const navigate = useCallback((slug) => {
    window.history.replaceState(window.history.state, "", `${urlWithoutHash()}${articleHash(slug)}`);
    setMorphContent(false); // only the first article morphs its cover / title; the panel keeps its origin card
    setOpenSlug(slug);
  }, []);

  const onCardOpen = useCallback(
    (e, slug) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // new tab / window: native
      e.preventDefault();
      if (railRef.current?.wasDragged()) return; // the press was a drag
      show(slug, { push: true });
    },
    [show],
  );

  // Deep link on load (after the section and its texts exist), then Back / Forward / typed hashes.
  const deepLinked = useRef(false);
  useEffect(() => {
    if (!articles || deepLinked.current) return undefined;
    deepLinked.current = true;
    const slug = slugFromHash(window.location.hash);
    if (!slug) return undefined;
    let cancelled = false;
    (async () => {
      await document.fonts?.ready;
      await nextFrame();
      if (cancelled) return;
      ScrollTrigger.refresh();
      const card = rootRef.current?.querySelector(`[data-article-card="${slug}"]`);
      if (card) {
        railRef.current?.reveal(slug, { immediate: true });
        const r = card.getBoundingClientRect();
        scrollTo(card, {
          immediate: true,
          offset: -Math.max(96, (window.innerHeight - r.height) / 2),
        });
      }
      await nextFrame();
      if (!cancelled) show(slug, { push: false });
    })();
    return () => {
      cancelled = true;
    };
  }, [articles, scrollTo, show]);

  useEffect(() => {
    const onHistory = () => {
      const slug = slugFromHash(window.location.hash);
      if (slug && slug !== openRef.current) {
        if (openRef.current) setOpenSlug(slug);
        else show(slug, { push: false });
      } else if (!slug && openRef.current) {
        close({ fromHistory: true });
      }
    };
    window.addEventListener("popstate", onHistory);
    window.addEventListener("hashchange", onHistory);
    return () => {
      window.removeEventListener("popstate", onHistory);
      window.removeEventListener("hashchange", onHistory);
    };
  }, [close, show]);

  // Focus goes back to the card that opened the reader (no scroll: it is where the reader came from).
  const onCloseAutoFocus = useCallback(
    (e) => {
      e.preventDefault();
      const slug = morphRef.current;
      const link = rootRef.current?.querySelector(`[data-article-link="${slug}"]`);
      link?.focus({ preventScroll: true });
      if (ctaPendingRef.current) {
        ctaPendingRef.current = false;
        scrollTo("#pricing");
      }
    },
    [scrollTo],
  );

  // Reader CTA: close, then glide to #pricing once the reader has gone (Lenis is running again by then).
  const onReaderCta = useCallback(() => {
    ctaPendingRef.current = true;
    close();
  }, [close]);

  const index = items.findIndex((a) => a.slug === openSlug);
  const current = index >= 0 ? items[index] : null;

  // Cards rise in once (opacity, not visibility, so screen readers always have the text).
  useGSAP(
    () => {
      if (!items.length || reduced) return;
      const cards = rootRef.current.querySelectorAll("[data-article-item]");
      gsap.set(cards, { opacity: 0, y: 36 });
      ScrollTrigger.create({
        trigger: rootRef.current.querySelector("[data-articles-list]"),
        start: "top 85%",
        once: true,
        onEnter: () =>
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.08,
            ease: "mv.out",
            clearProps: "opacity,transform",
          }),
      });
    },
    { scope: rootRef, dependencies: [items.length > 0, reduced, isDesktop] },
  );

  const renderCard = (item, i) => (
    <ArticleCard
      article={item}
      index={i}
      total={items.length}
      morph={morph}
      active={Boolean(openSlug) && morphSlug === item.slug}
      onOpen={onCardOpen}
      rail={isDesktop}
    />
  );

  return (
    <Section id="articles" bg="dim" aria-labelledby="articles-title">
      <MorphingDialogProvider>
        <div ref={rootRef}>
          <div className="container-mv">
            <SectionHeader
              id="articles"
              eyebrow={t("articles.eyebrow")}
              title={t("articles.title")}
              lead={t("articles.lead")}
              accentWords={2}
              align="left"
              titleId="articles-title"
            />
          </div>

          <div data-articles-list="" aria-busy={!articles} className={cn("mt-12 md:mt-16", !articles && "min-h-[560px]")}>
            {!articles ? (
              <p className="container-mv font-mono text-label uppercase text-mv-muted">{t("common.loading")}</p>
            ) : isDesktop ? (
              <ArticleRail
                ref={railRef}
                items={items}
                reduced={reduced}
                label={t("articles.eyebrow")}
                renderCard={(item, i) => (
                  <div data-article-item="" className="h-full">
                    {renderCard(item, i)}
                  </div>
                )}
              />
            ) : (
              <ul className="container-mv grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, i) => (
                  <li key={item.slug} data-article-item="">
                    {renderCard(item, i)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="container-mv mt-14 md:mt-20">
            <div className="stone relative flex flex-col items-start gap-6 overflow-hidden rounded-card p-7 sm:p-10 md:flex-row md:items-center md:justify-between">
              <ShineBorder />
              <div
                aria-hidden="true"
                className="aurora pointer-events-none absolute -left-24 -top-24 h-64 w-[60%] opacity-70 [mask-image:radial-gradient(closest-side,black_30%,transparent)]"
              />
              <p className="relative max-w-[30ch] font-display text-[clamp(1.45rem,2.6vw,2.1rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-mv-text">
                {t("articles.ctaStrip.title")}
              </p>
              <Magnet className="relative shrink-0">
                <button
                  type="button"
                  className="btn-primary whitespace-nowrap"
                  onClick={() => scrollTo("#pricing")}
                  data-articles-cta=""
                >
                  {t("articles.ctaStrip.button")}
                  <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </Magnet>
            </div>
          </div>
        </div>

        <ArticleReader
          article={current}
          open={Boolean(current)}
          morphSlug={morphSlug}
          morphContent={morphContent}
          reduced={reduced}
          fullScreen={!isDesktop}
          prev={index > 0 ? items[index - 1] : null}
          next={index >= 0 && index < items.length - 1 ? items[index + 1] : null}
          onClose={close}
          onNavigate={navigate}
          onCta={onReaderCta}
          onCloseAutoFocus={onCloseAutoFocus}
        />
      </MorphingDialogProvider>
    </Section>
  );
}
