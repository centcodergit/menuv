import { usePhoneMenuProps } from "@/components/hero/PhoneMenu";
import CardSwap from "@/components/features/CardSwap";
import TemplateThumb, { TEMPLATE_VARIANTS } from "@/components/features/TemplateThumb";

/** 03 Professional templates: Card Swap through four treatments of the same La Bella Italia menu, every 3.5s. */
export default function TemplatesDemo({ active, mode }) {
  const { labels, locale } = usePhoneMenuProps();
  return (
    <div className="relative h-full min-h-[360px]">
      <CardSwap active={active} mode={mode} interval={3.5}>
        {TEMPLATE_VARIANTS.map((variant) => (
          <TemplateThumb key={variant} variant={variant} labels={labels} locale={locale} />
        ))}
      </CardSwap>
    </div>
  );
}
