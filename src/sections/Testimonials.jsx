import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { TESTIMONIALS } from "@/content/testimonials";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/layout/SectionHeader";
import ScrollReveal from "@/components/fx/ScrollReveal";
import CircularText from "@/components/fx/CircularText";
import Magnet from "@/components/fx/Magnet";
import QuoteMarks from "@/components/testimonials/QuoteMarks";

/** The author's initial in a glass circle, ringed by rotating circular text. Others stack behind it (2+ items). */
function AuthorBadge({ item, others, ringText }) {
  return (
    <div className="relative">
      {others.map((o, i) => (
        <span
          key={o.id}
          aria-hidden="true"
          className="glass absolute left-1/2 top-1/2 flex h-14 w-14 items-center justify-center rounded-full font-serif-italic text-xl text-mv-muted"
          style={{ transform: `translate(${-50 + (i + 1) * 22}%, -50%) rotate(${(i + 1) * 8}deg)`, zIndex: -1 - i, opacity: 0.6 - i * 0.2 }}
        >
          {o.initial}
        </span>
      ))}
      <CircularText text={ringText}>
        <span className="glass flex h-16 w-16 items-center justify-center rounded-full font-serif-italic text-3xl text-mv-text shadow-[0_0_40px_-8px_rgb(var(--mv-violet-500)/0.6)]">
          {item.initial}
        </span>
      </CircularText>
    </div>
  );
}

/**
 * 7.10 Testimonials, "Είπαν για εμάς...": one real quote, set like a magazine pull quote. Words sharpen as you
 * scroll (Scroll Reveal), oversized violet quotation marks draw in, and the author's initial sits inside rotating
 * circular text. Built on the Animated Testimonials structure (crossfade, stacked authors) so more quotes can be
 * added in src/content/testimonials.js; arrows and dots appear only from two quotes up.
 */
export default function Testimonials() {
  const t = useT();
  const reduced = useReducedMotion();
  const items = [...TESTIMONIALS].sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  const item = items[index];
  const many = items.length > 1;
  const go = (step) => setIndex((i) => (i + step + items.length) % items.length);
  const others = many ? [...items.slice(index + 1), ...items.slice(0, index)].slice(0, 2) : [];

  return (
    <Section id="testimonials" bg="base" aria-labelledby="testimonials-title">
      <div className="container-mv">
        <SectionHeader
          id="testimonials"
          eyebrow={t("testimonials.eyebrow")}
          title={t("testimonials.title")}
          lead={t("testimonials.lead")}
          accentWords={1}
          titleId="testimonials-title"
        />
        <div className="relative mx-auto mt-16 max-w-5xl md:mt-24">
          <QuoteMarks className="pointer-events-none absolute -left-2 -top-10 w-20 md:-left-16 md:-top-14 md:w-32" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={item.id}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <blockquote>
                <ScrollReveal
                  text={t(`testimonials.items.${item.id}.quote`)}
                  className="max-w-[24ch] pt-10 font-serif-italic text-[clamp(1.8rem,3.6vw,3.25rem)] leading-[1.18] text-mv-text md:pl-6 md:pt-6"
                />
              </blockquote>
              <figcaption className="mt-12 flex items-center gap-5 md:pl-6">
                <AuthorBadge item={item} others={others} ringText={t(`testimonials.items.${item.id}.circularText`)} />
                <div>
                  <p className="font-display text-xl font-semibold text-mv-text">{item.author}</p>
                  <p className="mt-1 font-mono text-label uppercase text-mv-muted">{t(`testimonials.items.${item.id}.role`)}</p>
                </div>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          {many && (
            <div className="mt-12 flex items-center gap-6 md:pl-6">
              <Magnet>
                <button type="button" onClick={() => go(-1)} aria-label={t("common.prev")} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-mv-line-strong hover:bg-mv-violet-500/15">
                  <ArrowLeft size={18} strokeWidth={1.5} />
                </button>
              </Magnet>
              <div className="flex items-center gap-2">
                {items.map((it, i) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`${i + 1} / ${items.length}`}
                    aria-current={i === index}
                    className={cn("h-2 rounded-full transition-[width,background-color] duration-500 ease-mv-out", i === index ? "w-8 bg-mv-violet-400" : "w-2 bg-mv-line-strong")}
                  />
                ))}
              </div>
              <Magnet>
                <button type="button" onClick={() => go(1)} aria-label={t("common.next")} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-mv-line-strong hover:bg-mv-violet-500/15">
                  <ArrowRight size={18} strokeWidth={1.5} />
                </button>
              </Magnet>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
