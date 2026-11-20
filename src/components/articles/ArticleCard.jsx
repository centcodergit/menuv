import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { articleHash } from "@/content/articles";
import ArticleCover from "@/components/articles/ArticleCover";

/** Shared layoutIds between a card and the reader (Morphing Dialog). */
export const morphIds = (slug) => ({
  panel: `mv-article-${slug}`,
  cover: `mv-article-cover-${slug}`,
  pill: `mv-article-pill-${slug}`,
  title: `mv-article-title-${slug}`,
});

/**
 * One article card: generated cover, category tag, title (h3 with a stretched link to #article-{slug}),
 * clamped excerpt, read time and "Διάβασε άρθρο". The link is a real hash link, so modifier clicks open the
 * article in a new tab (the deep link opens it there). `active` = this card is the one morphed into the reader.
 * Memoised: hover/drag state never re-renders it (framer would re-measure it mid-drag).
 */
function ArticleCard({ article, index, total, morph, active, onOpen, rail }) {
  const t = useT();
  const ids = morph ? morphIds(article.slug) : {};
  const titleId = `article-card-title-${article.slug}`;

  return (
    <motion.article
      layoutId={ids.panel}
      data-article-card={article.slug}
      data-active={active || undefined}
      style={{ borderRadius: 28 }}
      className={cn(
        "stone group relative flex h-full flex-col p-3 transition-[border-color,box-shadow] duration-500 ease-mv-out",
        "hover:border-mv-violet-400/40 hover:shadow-[inset_0_1px_0_rgb(var(--mv-violet-300)/0.25),0_24px_60px_-30px_rgb(var(--mv-violet-500)/0.55)]",
        "has-[a:focus-visible]:border-mv-violet-400/60",
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-24 rounded-[inherit] bg-[radial-gradient(60%_100%_at_50%_0%,rgb(var(--mv-violet-500)/0.22),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <motion.div layoutId={ids.cover} className="relative">
        <ArticleCover cover={article.cover} category={article.category} index={index} total={total} className="aspect-[16/10]" />
      </motion.div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <motion.span
          layoutId={ids.pill}
          className="w-fit rounded-full border border-mv-line-strong bg-mv-surface-2/70 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-mv-violet-300"
        >
          {article.category}
        </motion.span>
        <motion.h3
          layoutId={ids.title}
          className="mt-4 font-display text-[clamp(1.2rem,1.5vw,1.4rem)] font-semibold leading-[1.22] tracking-[-0.02em] text-mv-text"
        >
          <a
            id={titleId}
            href={articleHash(article.slug)}
            draggable={false}
            onClick={(e) => onOpen(e, article.slug)}
            data-article-link={article.slug}
            className="outline-none after:absolute after:inset-0 after:z-[1] after:rounded-[28px] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-mv-violet-400"
          >
            {article.title}
          </a>
        </motion.h3>
        <p className={cn("mt-3 text-[0.975rem] leading-relaxed text-mv-muted", rail ? "line-clamp-3" : "line-clamp-4")}>
          {article.excerpt}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-6">
          <span className="font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-mv-muted">
            {t("articles.readTime", { n: article.readTime })}
          </span>
          <span aria-hidden="true" className="inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-mv-violet-300">
            {t("articles.read")}
            <ArrowRight
              size={17}
              strokeWidth={1.75}
              className="transition-transform duration-300 ease-mv-out group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default memo(ArticleCard);
