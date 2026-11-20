import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLenisLock } from "@/hooks/useSmoothScroll";
import MorphingDialog, { MorphingDialogClose, MorphingDialogTitle } from "@/components/fx/MorphingDialog";
import ArticleCover from "@/components/articles/ArticleCover";
import { morphIds } from "@/components/articles/ArticleCard";

/** Thin reading-progress bar: scaleX follows the body's scroll (written to the DOM, no React state per scroll). */
function useReadingProgress(bodyRef, barRef) {
  const frame = useRef(0);
  const update = useCallback(() => {
    frame.current = 0;
    const body = bodyRef.current;
    const bar = barRef.current;
    if (!body || !bar) return;
    const max = body.scrollHeight - body.clientHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, body.scrollTop / max) : 0})`;
  }, [bodyRef, barRef]);
  const onScroll = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(update);
  }, [update]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return { onScroll, update };
}

function Body({ article, morph, reduced, children }) {
  const ids = morph ? morphIds(article.slug) : {};
  const t = useT();
  const enter = reduced ? { opacity: 0 } : { opacity: 0, y: 14 };
  return (
    <>
      <motion.div layoutId={ids.cover} className="relative px-3 pt-3 sm:px-4 sm:pt-4">
        <ArticleCover
          cover={article.cover}
          category={article.category}
          index={article.index}
          total={article.total}
          size="reader"
          className="h-[clamp(170px,28vh,260px)]"
        />
      </motion.div>
      <div className="mx-auto w-full max-w-reading px-5 pb-16 pt-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <motion.span
            layoutId={ids.pill}
            className="w-fit rounded-full border border-mv-line-strong bg-mv-surface-2/70 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-mv-violet-300"
          >
            {article.category}
          </motion.span>
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-mv-muted">
            {t("articles.readTime", { n: article.readTime })}
          </span>
        </div>
        <MorphingDialogTitle asChild>
          <motion.h2
            data-reader-title=""
            layoutId={ids.title}
            className="mt-5 font-display text-[clamp(1.75rem,3.4vw,2.6rem)] font-bold leading-[1.08] tracking-[-0.035em] text-mv-text"
          >
            {article.title}
          </motion.h2>
        </MorphingDialogTitle>
        <motion.div
          initial={enter}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0.2 : 0.6,
            delay: reduced ? 0 : 0.18,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-8 font-sans text-[17px] leading-[1.75] text-mv-text/90"
        >
          {article.body.map((block, i) =>
            block.type === "h3" ? (
              <h3
                key={i}
                className="mb-3 mt-10 font-display text-[clamp(1.2rem,1.7vw,1.4rem)] font-semibold leading-snug tracking-[-0.02em] text-mv-text"
              >
                {block.text}
              </h3>
            ) : (
              <p key={i} className={cn("mb-5", i === 0 && "text-[1.125rem] text-mv-text")}>
                {block.text}
              </p>
            ),
          )}
          {children}
        </motion.div>
      </div>
    </>
  );
}

/**
 * The reader (master prompt 7.13): the clicked card morphs into this modal. Category pill, title (Commissioner
 * 700), read time, body (Inter 17px / 1.75 / 68ch, h3 in Commissioner 600), a reading-progress bar along the
 * top, the closing CTA and previous / next. The body scrolls natively (data-lenis-prevent); Lenis is stopped.
 * Mobile / touch / < 1024px: full screen.
 */
export default function ArticleReader({
  article: requested,
  open,
  morphSlug,
  morphContent,
  reduced,
  fullScreen,
  prev,
  next,
  onClose,
  onNavigate,
  onCta,
  onCloseAutoFocus,
}) {
  const t = useT();
  const bodyRef = useRef(null);
  const barRef = useRef(null);
  // Keep the last article on screen while the panel morphs back into its card.
  const lastRef = useRef(null);
  if (requested) lastRef.current = requested;
  const article = requested ?? lastRef.current;
  useLenisLock(open);
  const progress = useReadingProgress(bodyRef, barRef);

  // New article (prev / next): start at the top and move focus to the text.
  const shownSlug = article?.slug;
  const firstShown = useRef(null);
  useEffect(() => {
    if (!open || !shownSlug) {
      firstShown.current = null;
      return;
    }
    if (firstShown.current === null) {
      firstShown.current = shownSlug;
      return;
    }
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = 0;
    progress.update();
    body.focus({ preventScroll: true });
  }, [open, shownSlug, progress]);

  const navButton = (target, dir) =>
    target ? (
      <button
        type="button"
        onClick={() => onNavigate(target.slug)}
        className={cn(
          "group flex min-h-[44px] flex-col gap-1.5 rounded-inner border border-mv-line p-4 transition-colors duration-300 hover:border-mv-violet-400/50 hover:bg-mv-violet-500/10",
          dir === "next" ? "items-end text-right" : "items-start text-left",
        )}
      >
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-mv-violet-300">
          {dir === "prev" && <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />}
          {t(`articles.${dir}`)}
          {dir === "next" && <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />}
        </span>
        <span className="line-clamp-2 font-display text-[0.98rem] font-semibold leading-snug text-mv-text">{target.title}</span>
      </button>
    ) : (
      <span aria-hidden="true" />
    );

  return (
    <MorphingDialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      layoutId={morphSlug ? morphIds(morphSlug).panel : undefined}
      reduced={reduced}
      fullScreen={fullScreen}
      data-article-reader={article?.slug}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        bodyRef.current?.focus({ preventScroll: true });
      }}
      onCloseAutoFocus={onCloseAutoFocus}
    >
      {article && (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-mv-line">
            <span
              ref={barRef}
              data-reading-progress=""
              className="block h-full origin-left bg-[linear-gradient(90deg,rgb(var(--mv-violet-500)),rgb(var(--mv-orchid)))]"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <MorphingDialogClose className="glass absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full text-mv-text transition-colors hover:text-mv-violet-300 sm:right-6 sm:top-6">
            <X size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">{t("articles.close")}</span>
          </MorphingDialogClose>
          <div
            ref={bodyRef}
            tabIndex={-1}
            data-lenis-prevent=""
            data-reader-body=""
            onScroll={progress.onScroll}
            className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none"
          >
            {/* prev / next: the new article fades in (the morphing first article needs no fade) */}
            <motion.div
              key={article.slug}
              initial={firstShown.current === null || firstShown.current === article.slug ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Body article={article} morph={morphContent && article.slug === morphSlug} reduced={reduced}>
                <div className="mt-12 rounded-card border border-mv-violet-400/30 bg-mv-violet-500/10 p-4 text-center sm:p-8">
                  <button type="button" onClick={onCta} className="btn-primary w-full text-balance sm:w-auto" data-reader-cta="">
                    {t("articles.readerCta")}
                    <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
                <nav aria-label={`${t("articles.prev")} / ${t("articles.next")}`} className="mt-8 grid grid-cols-2 gap-3">
                  {navButton(prev, "prev")}
                  {navButton(next, "next")}
                </nav>
              </Body>
            </motion.div>
          </div>
        </>
      )}
    </MorphingDialog>
  );
}
