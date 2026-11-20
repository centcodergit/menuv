import Section from "@/components/layout/Section";

/**
 * TEMPORARY (Phase 1): visible scaffold for a homepage section that is not built yet.
 * The label is developer-facing and disappears when the section is built.
 */
export default function SectionPlaceholder({ id, number, name, bg = "base", tall = false }) {
  return (
    <Section id={id} bg={bg} aria-label={name}>
      <div className="container-mv">
        <div
          className={`stone flex flex-col items-start justify-end gap-3 rounded-card p-8 ${tall ? "min-h-[90vh]" : "min-h-[60vh]"}`}
        >
          <span className="eyebrow">{number}</span>
          <p className="font-display text-h3 font-semibold">{name}</p>
          <p className="font-mono text-label uppercase text-mv-muted">
            {id ? `#${id} · ` : ""}bg: {bg}
          </p>
        </div>
      </div>
    </Section>
  );
}
