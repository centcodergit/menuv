import { MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { openChat } from "@/lib/chatBus";
import RichText from "@/components/legal/RichText";

/** "Label: text" list items get their label set in medium weight (presentation only; wording unchanged). */
function ListItem({ text, currentPath }) {
  const m = /^([^:]{2,48}):\s(.+)$/.exec(text);
  return (
    <li className="relative pl-6 before:absolute before:left-0 before:top-[0.72em] before:h-[6px] before:w-[6px] before:rounded-[1.5px] before:bg-mv-violet-400 before:shadow-[0_0_8px_rgb(var(--mv-violet-500)/0.6)]">
      {m ? (
        <>
          <span className="font-medium text-mv-text">{m[1]}:</span> <RichText text={m[2]} currentPath={currentPath} />
        </>
      ) : (
        <RichText text={text} currentPath={currentPath} />
      )}
    </li>
  );
}

/** Renders one legal section's blocks: p, h3, ul (violet QR-module markers), chat button. */
export default function LegalBlocks({ blocks, currentPath }) {
  const { t, lang } = useI18n();
  return blocks.map((block, i) => {
    switch (block.type) {
      case "h3":
        return (
          <h3 key={i} className="pt-2 font-display text-lg font-semibold tracking-tight text-mv-text">
            {block.text}
          </h3>
        );
      case "ul":
        return (
          <ul key={i} className="space-y-2.5">
            {block.items.map((item, j) => (
              <ListItem key={j} text={item} currentPath={currentPath} />
            ))}
          </ul>
        );
      case "chat":
        return (
          <div key={i} className="pt-2">
            {/* UI chrome speaks the visitor's language even inside an English-only document. */}
            <button type="button" lang={lang} onClick={() => openChat()} className="btn-outline">
              <MessageCircle size={18} strokeWidth={1.5} />
              <span>{t("legal.openChat")}</span>
            </button>
          </div>
        );
      default:
        return (
          <p key={i}>
            <RichText text={block.text} currentPath={currentPath} />
          </p>
        );
    }
  });
}
