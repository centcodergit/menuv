import { QrCode, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = { scan: QrCode, live: Zap };

/** Glass chip next to the hero phone: "Σκανάρετε το QR / Άμεση Πρόσβαση", "Σε πραγματικό χρόνο / Ζωντανές Ενημερώσεις". */
export default function HeroChip({ kind, title, sub, className, style }) {
  const Icon = ICONS[kind];
  return (
    <div
      className={cn("glass flex items-center gap-3 rounded-[18px] py-2.5 pl-2.5 pr-4 text-left shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]", className)}
      style={style}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-mv-violet-500 to-mv-violet-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <span className="whitespace-nowrap">
        <span className="block text-[13px] font-semibold leading-tight text-mv-text">{title}</span>
        <span className="block text-[11.5px] leading-tight text-mv-muted">{sub}</span>
      </span>
    </div>
  );
}
