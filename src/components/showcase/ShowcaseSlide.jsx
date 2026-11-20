import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import Magnet from "@/components/fx/Magnet";
import TiltedCard from "@/components/fx/TiltedCard";
import LivePhone from "@/components/showcase/LivePhone";

/** Stand-in until the owner uploads the restaurant photo: warm light, no stock imagery. */
function PhotoPlaceholder({ name }) {
  return (
    <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 30% 25%, rgba(233,216,166,0.28), transparent 60%), radial-gradient(60% 70% at 80% 80%, rgba(124,58,237,0.35), transparent 65%), linear-gradient(160deg, #1D1626, #0B0A12)" }}>
      <span aria-hidden="true" className="absolute right-6 top-6 font-serif-italic text-[7rem] leading-none text-white/10">{name.charAt(0)}</span>
    </div>
  );
}

/**
 * One showcase client (master prompt 7.7): left, the restaurant photo on a Tilted Card with the name over it;
 * right, the client's live menu in a phone. "Δείτε το Μενού" opens the menu in a new tab (magnetic, the arrow
 * turns 45° on hover).
 */
export default function ShowcaseSlide({ item, role }) {
  const t = useT();
  return (
    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
      <TiltedCard className="lg:col-span-7">
        <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-mv-line shadow-[0_50px_120px_-50px_rgba(0,0,0,0.8)]">
          {item.image ? (
            <img src={item.image} alt={item.name} width={1200} height={900} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <PhotoPlaceholder name={item.name} />
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-6 p-6 md:p-8">
            <div>
              {role && <p className="mb-2 font-mono text-label uppercase text-white/70">{role}</p>}
              <h3 className="font-display text-[clamp(1.8rem,3.2vw,2.8rem)] font-bold leading-none tracking-[-0.03em] text-white">{item.name}</h3>
            </div>
            <Magnet>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-primary group">
                {t("showcase.cta")}
                <ArrowRight size={18} strokeWidth={1.75} className="transition-transform duration-300 ease-mv-out group-hover:-rotate-45" />
                <span className="sr-only">{t("showcase.newTab")}</span>
              </a>
            </Magnet>
          </div>
        </div>
      </TiltedCard>
      <div className="mx-auto w-[min(72vw,300px)] lg:col-span-5 lg:w-full lg:max-w-[320px]">
        <LivePhone url={item.preview?.url ?? item.url} name={item.preview?.name ?? item.name} fallback={<PhotoPlaceholder name={item.name} />} />
      </div>
    </div>
  );
}
